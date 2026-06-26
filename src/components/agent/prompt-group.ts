import type { AuditEvent } from "../../types";

export interface PromptGroup {
  taskId: string;
  prompt: string;
  role: string;
  timestamp: string;
  status: string;
  events: AuditEvent[];
  allowCount: number;
  denyCount: number;
  bypassedCount: number;
}
