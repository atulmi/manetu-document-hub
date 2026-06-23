import { EventEmitter } from 'node:events';
import type { AuditEvent } from '../types.ts';

const BUFFER_SIZE = 50;

class AuditBus extends EventEmitter {
  private buffer: AuditEvent[] = [];

  emit(event: 'audit', data: AuditEvent): boolean;
  emit(event: string, ...args: unknown[]): boolean {
    if (event === 'audit') {
      const auditEvent = args[0] as AuditEvent;
      this.buffer.push(auditEvent);
      if (this.buffer.length > BUFFER_SIZE) {
        this.buffer.shift();
      }
    }
    return super.emit(event, ...args);
  }

  getRecentEvents(): AuditEvent[] {
    return [...this.buffer];
  }
}

export const auditBus = new AuditBus();
