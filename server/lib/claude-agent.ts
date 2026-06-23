import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'node:crypto';
import type {
  UserRole,
  AgentTask,
  AgentStep,
  AuditEvent,
  MCPToolCall,
  PolicyDecision,
  DocSensitivity,
} from '../types.ts';
import type { MPEClient } from './mpe-client.ts';
import type { MCPFilesystemClient } from './mcp-fs-client.ts';

export interface AgentRunOptions {
  prompt: string;
  role: UserRole;
  securityEnabled: boolean;
  onStep: (step: AgentStep) => void;
  onAudit: (event: AuditEvent) => void;
  mpeClient: MPEClient;
  fsClient: MCPFilesystemClient;
}

const SYSTEM_PROMPT = `You are a document intelligence assistant. You help users find and understand company documents.
You have access to a document library organized by sensitivity level (public, internal, confidential).
Your tool calls are enforced by a security policy engine. If access is denied, explain that the document
is restricted for the current user role and suggest what role would have access.
Always start by listing available documents before trying to read specific files.`;

const TOOL_DEFS: Anthropic.Tool[] = [
  {
    name: 'list-directory',
    description: 'List documents in a directory of the document corpus. Use "." for root, or "public", "internal", "confidential" for specific tiers.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Directory path relative to corpus root' },
      },
      required: ['path'],
    },
  },
  {
    name: 'read-file',
    description: 'Read the full contents of a document. Path is relative to corpus root (e.g. "public/company-overview.md").',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'File path relative to corpus root' },
      },
      required: ['path'],
    },
  },
  {
    name: 'keyword-search',
    description: 'Search the document corpus for documents matching a keyword query. Returns matching documents sorted by relevance.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query (space-separated keywords)' },
        scope: {
          type: 'array',
          items: { type: 'string', enum: ['public', 'internal', 'confidential'] },
          description: 'Sensitivity tiers to search within',
        },
      },
      required: ['query', 'scope'],
    },
  },
];

const TOOL_MRN_MAP: Record<string, string> = {
  'list-directory': 'mrn:mcp:filesystem:tool:list-directory',
  'read-file': 'mrn:mcp:filesystem:tool:read-file',
  'keyword-search': 'mrn:mcp:docs:tool:keyword-search',
};

function now(): string {
  return new Date().toISOString();
}

async function executeTool(
  fsClient: MCPFilesystemClient,
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (toolName) {
    case 'list-directory':
      return fsClient.listDirectory(args['path'] as string);
    case 'read-file':
      return fsClient.readFile(args['path'] as string);
    case 'keyword-search':
      return fsClient.keywordSearch(
        args['query'] as string,
        args['scope'] as DocSensitivity[],
      );
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export async function runAgentLoop(opts: AgentRunOptions): Promise<AgentTask> {
  const { prompt, role, securityEnabled, onStep, onAudit, mpeClient, fsClient } = opts;
  const taskId = randomUUID();
  const task: AgentTask = {
    id: taskId,
    prompt,
    role,
    status: 'running',
    steps: [],
    startedAt: now(),
  };

  const anthropic = new Anthropic();
  let stepNumber = 0;

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: prompt },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: TOOL_DEFS,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text' && block.text.trim()) {
        stepNumber++;
        const isLastBlock = response.stop_reason === 'end_turn' &&
          block === response.content[response.content.length - 1];

        const step: AgentStep = {
          stepNumber,
          type: isLastBlock ? 'final-answer' : 'thinking',
          content: block.text,
          timestamp: now(),
        };
        task.steps.push(step);
        onStep(step);

        if (isLastBlock) {
          task.finalAnswer = block.text;
        }
      }

      if (block.type === 'tool_use') {
        const toolName = block.name;
        const mrn = TOOL_MRN_MAP[toolName] ?? `mrn:mcp:unknown:tool:${toolName}`;
        const args = block.input as Record<string, unknown>;

        let policyDecision: PolicyDecision;
        let result: unknown;
        let error: string | undefined;
        const startMs = Date.now();

        if (securityEnabled) {
          policyDecision = await mpeClient.evaluate({
            principal: role,
            resource: mrn,
            operation: 'invoke',
          });
        } else {
          policyDecision = {
            decision: 'allow',
            principal: role,
            resource: mrn,
            operation: 'invoke',
            rule: 'security-disabled',
            reason: 'Policy engine disabled — all calls bypassed',
          };
        }

        const auditEvent: AuditEvent = {
          id: randomUUID(),
          timestamp: now(),
          principal: role,
          resource: mrn,
          operation: 'invoke',
          decision: securityEnabled ? policyDecision.decision : 'bypassed',
          policyRule: policyDecision.rule,
          agentTaskId: taskId,
        };
        onAudit(auditEvent);

        if (policyDecision.decision === 'deny') {
          error = `Access denied by policy engine: ${policyDecision.rule ?? 'default-deny'}`;
        } else {
          try {
            result = await executeTool(fsClient, toolName, args);
          } catch (err) {
            error = err instanceof Error ? err.message : String(err);
          }
        }

        const durationMs = Date.now() - startMs;

        const toolCall: MCPToolCall = {
          toolName,
          mrn,
          args,
          policyDecision,
          result: error ? undefined : result,
          error,
          durationMs,
        };

        stepNumber++;
        const step: AgentStep = {
          stepNumber,
          type: 'tool-call',
          content: error
            ? `Tool ${toolName} denied: ${error}`
            : `Tool ${toolName} executed successfully`,
          toolCall,
          timestamp: now(),
        };
        task.steps.push(step);
        onStep(step);

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: error ?? JSON.stringify(result),
        });
      }
    }

    if (response.stop_reason === 'end_turn') {
      continueLoop = false;
    } else if (toolResults.length > 0) {
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    } else {
      continueLoop = false;
    }
  }

  task.status = 'completed';
  task.completedAt = now();
  return task;
}
