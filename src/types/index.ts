// Roles
export type UserRole = 'developer' | 'data-analyst' | 'viewer' | 'auditor' | 'admin';
export const ALL_ROLES: UserRole[] = ['viewer', 'developer', 'data-analyst', 'auditor', 'admin'];

// Document sensitivity
export type DocSensitivity = 'public' | 'internal' | 'confidential';

// Document metadata (returned by list-directory tool)
export interface DocMeta {
  id: string;
  title: string;
  path: string;
  sensitivity: DocSensitivity;
  excerpt: string;       // first ~120 chars of content
  sizeBytes: number;
  accessible?: boolean;  // enriched by backend: MPE allow/deny for current role
}

// Policy decision from MPE
export interface PolicyDecision {
  decision: 'allow' | 'deny';
  principal: UserRole;
  resource: string;      // MRN e.g. "mrn:mcp:filesystem:tool:read-file"
  operation: 'invoke' | 'discover' | 'read';
  rule?: string;         // e.g. "viewer-public-only-scope"
  reason?: string;
}

// MCP tool descriptor
export interface MCPToolDef {
  name: string;
  mrn: string;
  description: string;
  inputSchema: Record<string, unknown>;
  accessible?: boolean;  // enriched by backend
  deniedReason?: string;
}

// A single MCP tool invocation within an agent step
export interface MCPToolCall {
  toolName: string;
  mrn: string;
  args: Record<string, unknown>;
  policyDecision: PolicyDecision;
  result?: unknown;
  error?: string;
  durationMs?: number;
}

// A single step in an agent's reasoning chain
export interface AgentStep {
  stepNumber: number;
  type: 'thinking' | 'tool-call' | 'final-answer';
  content: string;
  toolCall?: MCPToolCall;
  timestamp: string;     // ISO 8601
}

// A full agent task run
export interface AgentTask {
  id: string;
  prompt: string;
  role: UserRole;
  status: 'running' | 'completed' | 'failed';
  steps: AgentStep[];
  finalAnswer?: string;
  startedAt: string;
  completedAt?: string;
}

// Audit log event emitted after each policy evaluation
export interface AuditEvent {
  id: string;
  timestamp: string;
  principal: UserRole;
  resource: string;      // MRN
  operation: string;
  decision: 'allow' | 'deny' | 'bypassed';
  policyRule?: string;
  agentTaskId: string;
}

// SSE event envelopes (discriminated union)
export type AgentSSEEvent =
  | { type: 'step';  data: AgentStep }
  | { type: 'audit'; data: AuditEvent }
  | { type: 'done';  data: { taskId: string } }
  | { type: 'error'; data: { message: string } };
