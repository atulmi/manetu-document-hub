import type { UserRole, PolicyDecision } from '../types.ts';

export interface EvaluateRequest {
  principal: UserRole;
  resource: string;
  operation: 'invoke' | 'discover' | 'read';
}

export class MPEConnectionError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'MPEConnectionError';
    this.cause = cause;
  }
}

export class MPEEvaluationError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = 'MPEEvaluationError';
    this.status = status;
    this.body = body;
  }
}

interface OpaAuthzResult {
  result?: {
    allow: boolean;
    rule?: string;
    reason?: string;
  };
}

export class MPEClient {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async evaluate(req: EvaluateRequest): Promise<PolicyDecision> {
    const url = `${this.baseUrl}/v1/data/docs/authz`;
    const body = JSON.stringify({
      input: {
        principal: req.principal,
        resource: req.resource,
        operation: req.operation,
      },
    });

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    } catch (err) {
      throw new MPEConnectionError(
        `Failed to connect to MPE at ${this.baseUrl}`,
        err,
      );
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new MPEEvaluationError(
        `MPE returned ${res.status}`,
        res.status,
        text,
      );
    }

    const data = (await res.json()) as OpaAuthzResult;
    const result = data.result;

    return {
      decision: result?.allow ? 'allow' : 'deny',
      principal: req.principal,
      resource: req.resource,
      operation: req.operation,
      rule: result?.rule,
      reason: result?.reason,
    };
  }

  async discover(
    principal: UserRole,
    mrns: string[],
    operation: 'invoke' | 'discover' | 'read' = 'invoke',
  ): Promise<string[]> {
    const results = await Promise.all(
      mrns.map(async (mrn) => {
        const decision = await this.evaluate({
          principal,
          resource: mrn,
          operation,
        });
        return { mrn, allowed: decision.decision === 'allow' };
      }),
    );
    return results.filter((r) => r.allowed).map((r) => r.mrn);
  }
}

export function buildMPEClient(): MPEClient {
  return new MPEClient(process.env['MPE_BASE_URL'] ?? 'http://localhost:8181');
}
