import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { MPEClient } from '../mpe-client.ts';
import { requestedTiers, checkTierAccess } from '../claude-agent.ts';

describe('requestedTiers', () => {
  it('reads the single tier from a read-file path', () => {
    expect(requestedTiers('read-file', { path: 'confidential/q3-financials.md' })).toEqual([
      'confidential',
    ]);
    expect(requestedTiers('read-file', { path: 'public/company-overview.md' })).toEqual([
      'public',
    ]);
  });

  it('returns no tiers for a read-file path with no recognized tier prefix', () => {
    expect(requestedTiers('read-file', { path: 'README.md' })).toEqual([]);
  });

  // Regression for the gap found while scoping i-chained-escalation-demo:
  // keyword-search's scope can request several tiers at once, and every one
  // of them needs to go through the same tier check read-file gets, or a
  // role with general keyword-search access could search tiers it has no
  // read grant for.
  it('reads every requested tier from a keyword-search scope', () => {
    expect(
      requestedTiers('keyword-search', { query: 'security policy', scope: ['public', 'confidential'] }),
    ).toEqual(['public', 'confidential']);
  });

  it('ignores unrecognized values in a keyword-search scope', () => {
    expect(requestedTiers('keyword-search', { scope: ['public', 'not-a-real-tier'] })).toEqual([
      'public',
    ]);
  });

  it('returns no tiers for a tool with no tier-scoped resource (e.g. list-directory)', () => {
    expect(requestedTiers('list-directory', { path: '.' })).toEqual([]);
  });
});

describe('checkTierAccess', () => {
  const OPA_URL = 'http://localhost:9999';
  const AUTHZ_PATH = `${OPA_URL}/v1/data/docs/authz`;
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('returns the deny decision when a requested tier is denied', async () => {
    server.use(
      http.post(AUTHZ_PATH, async ({ request }) => {
        const body = (await request.json()) as { input: { resource: string } };
        const allow = !body.input.resource.includes('confidential');
        return HttpResponse.json({
          result: { allow, rule: allow ? 'developer-read' : 'default-deny' },
        });
      }),
    );

    const client = new MPEClient(OPA_URL);
    const decision = await checkTierAccess(client, 'developer', ['public', 'confidential']);

    expect(decision?.decision).toBe('deny');
    expect(decision?.rule).toBe('default-deny');
  });

  it('returns null when every requested tier is allowed', async () => {
    server.use(
      http.post(AUTHZ_PATH, () =>
        HttpResponse.json({ result: { allow: true, rule: 'developer-read' } }),
      ),
    );

    const client = new MPEClient(OPA_URL);
    const decision = await checkTierAccess(client, 'developer', ['public', 'internal']);

    expect(decision).toBeNull();
  });
});
