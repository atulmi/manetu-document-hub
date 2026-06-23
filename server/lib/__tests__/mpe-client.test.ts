import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { MPEClient, MPEConnectionError, MPEEvaluationError } from '../mpe-client.ts';

const OPA_URL = 'http://localhost:9999';
const AUTHZ_PATH = `${OPA_URL}/v1/data/docs/authz`;

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MPEClient.evaluate', () => {
  it('returns allow for admin + confidential resource', async () => {
    server.use(
      http.post(AUTHZ_PATH, () =>
        HttpResponse.json({
          result: { allow: true, rule: 'admin-unrestricted', reason: 'Admin has full access' },
        }),
      ),
    );

    const client = new MPEClient(OPA_URL);
    const decision = await client.evaluate({
      principal: 'admin',
      resource: 'mrn:mcp:docs:resource:confidential:board-update',
      operation: 'read',
    });

    expect(decision.decision).toBe('allow');
    expect(decision.rule).toBe('admin-unrestricted');
    expect(decision.principal).toBe('admin');
    expect(decision.resource).toBe('mrn:mcp:docs:resource:confidential:board-update');
  });

  it('returns deny for viewer + confidential resource', async () => {
    server.use(
      http.post(AUTHZ_PATH, () =>
        HttpResponse.json({
          result: { allow: false, rule: 'default-deny', reason: 'No matching rule' },
        }),
      ),
    );

    const client = new MPEClient(OPA_URL);
    const decision = await client.evaluate({
      principal: 'viewer',
      resource: 'mrn:mcp:docs:resource:confidential:board-update',
      operation: 'read',
    });

    expect(decision.decision).toBe('deny');
    expect(decision.rule).toBe('default-deny');
  });

  it('throws MPEConnectionError on network failure', async () => {
    const client = new MPEClient('http://localhost:1');

    await expect(
      client.evaluate({
        principal: 'viewer',
        resource: 'mrn:mcp:docs:resource:public:readme',
        operation: 'read',
      }),
    ).rejects.toThrow(MPEConnectionError);
  });

  it('throws MPEEvaluationError on non-2xx response', async () => {
    server.use(
      http.post(AUTHZ_PATH, () =>
        HttpResponse.text('internal error', { status: 500 }),
      ),
    );

    const client = new MPEClient(OPA_URL);

    await expect(
      client.evaluate({
        principal: 'viewer',
        resource: 'mrn:mcp:docs:resource:public:readme',
        operation: 'read',
      }),
    ).rejects.toThrow(MPEEvaluationError);
  });
});

describe('MPEClient.discover', () => {
  it('returns only allowed MRNs', async () => {
    server.use(
      http.post(AUTHZ_PATH, async ({ request }) => {
        const body = (await request.json()) as { input: { resource: string } };
        const allowed = body.input.resource.includes('public');
        return HttpResponse.json({
          result: { allow: allowed, rule: allowed ? 'viewer-public-read' : 'default-deny' },
        });
      }),
    );

    const client = new MPEClient(OPA_URL);
    const mrns = await client.discover('viewer', [
      'mrn:mcp:docs:resource:public:readme',
      'mrn:mcp:docs:resource:confidential:financials',
      'mrn:mcp:docs:resource:public:faq',
    ]);

    expect(mrns).toEqual([
      'mrn:mcp:docs:resource:public:readme',
      'mrn:mcp:docs:resource:public:faq',
    ]);
  });
});
