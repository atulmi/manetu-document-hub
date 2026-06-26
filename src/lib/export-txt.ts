import type { AgentTask, AuditEvent } from '../types';

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

function divider(char = '─', len = 60): string {
  return char.repeat(len);
}

function formatTask(task: AgentTask, events: AuditEvent[]): string[] {
  const lines: string[] = [];
  const allowed = events.filter((e) => e.decision === 'allow').length;
  const denied = events.filter((e) => e.decision === 'deny').length;
  const bypassed = events.filter((e) => e.decision === 'bypassed').length;

  lines.push(divider());
  lines.push(`PROMPT:    ${task.prompt}`);
  lines.push(`Role:      ${task.role}`);
  lines.push(`Status:    ${task.status}`);
  lines.push(`Started:   ${formatTime(task.startedAt)}`);
  if (task.completedAt) lines.push(`Completed: ${formatTime(task.completedAt)}`);
  lines.push(`Steps:     ${task.steps.length}`);
  if (allowed + denied + bypassed > 0) {
    lines.push(`Policy:    ${allowed} allowed, ${denied} denied, ${bypassed} bypassed`);
  }
  lines.push(divider());
  lines.push('');

  for (const step of task.steps) {
    if (step.type === 'thinking') {
      lines.push(`  [Step ${step.stepNumber}] Thinking`);
      lines.push(`  ${step.content}`);
      lines.push('');
    } else if (step.type === 'tool-call' && step.toolCall) {
      const tc = step.toolCall;
      const decision = tc.policyDecision.decision.toUpperCase();
      lines.push(`  [Step ${step.stepNumber}] Tool Call — ${decision}`);
      lines.push(`  Tool:     ${tc.toolName}`);
      lines.push(`  MRN:      ${tc.mrn}`);
      lines.push(`  Args:     ${JSON.stringify(tc.args)}`);
      lines.push(`  Decision: ${decision}`);
      if (tc.policyDecision.rule) lines.push(`  Rule:     ${tc.policyDecision.rule}`);
      if (tc.error) {
        lines.push(`  Error:    ${tc.error}`);
      } else if (tc.result) {
        const resultStr = JSON.stringify(tc.result);
        lines.push(`  Result:   ${resultStr.length > 200 ? resultStr.slice(0, 200) + '...' : resultStr}`);
      }
      if (tc.durationMs != null) lines.push(`  Duration: ${tc.durationMs}ms`);
      lines.push('');
    } else if (step.type === 'final-answer') {
      lines.push(`  [Final Answer]`);
      lines.push(`  ${step.content}`);
      lines.push('');
    }
  }

  if (events.length > 0) {
    lines.push('  POLICY CHECKS:');
    for (const event of events) {
      const tool = event.resource.split(':').pop() ?? event.resource;
      lines.push(`    ${event.decision.toUpperCase().padEnd(8)} ${tool.padEnd(20)} ${event.resource}`);
      if (event.policyRule) lines.push(`${''.padEnd(13)}Rule: ${event.policyRule}`);
    }
    lines.push('');
  }

  return lines;
}

export function exportFullReport(tasks: AgentTask[], auditEvents: AuditEvent[]) {
  const lines: string[] = [];

  lines.push('MANETU AI DOCUMENT HUB — FULL AUDIT REPORT');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push(`Total runs: ${tasks.length}`);
  lines.push(divider('='));
  lines.push('');

  for (const task of tasks) {
    const events = auditEvents.filter((e) => e.agentTaskId === task.id);
    lines.push(...formatTask(task, events));
    lines.push('');
  }

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  download(`manetu-audit-report-${timestamp}.txt`, lines.join('\n'));
}

export function exportSingleRun(task: AgentTask, auditEvents: AuditEvent[]) {
  const events = auditEvents.filter((e) => e.agentTaskId === task.id);
  const lines: string[] = [];

  lines.push('MANETU AI DOCUMENT HUB — PROMPT RUN REPORT');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push(divider('='));
  lines.push('');
  lines.push(...formatTask(task, events));

  const slug = task.prompt.slice(0, 30).replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+$/, '').toLowerCase();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  download(`manetu-run-${slug}-${timestamp}.txt`, lines.join('\n'));
}
