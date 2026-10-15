import './commands';

// Every spec renders the Prompt History panel, which fetches these on
// mount/interval regardless of what the spec itself is testing. Stub them
// globally so specs don't each need to know about the Elasticsearch-backed
// history feature (see ISSUE-030) unless they're specifically testing it.
//
// /api/audit/backfill is stubbed here too: useHistorySync fires a backfill
// attempt immediately (no initial delay) whenever a run finishes, in every
// spec that submits an agent task. Left unmocked, that's a real network
// call hitting a backend that doesn't exist in CI — against this repo's
// own "cy.intercept() mocks all backend calls" rule, and a source of
// needless console noise/latency in every such test.
//
// It's stubbed to FAIL (503, matching the elasticsearch:false health stub
// above), not succeed — a successful backfill calls markSynced, which
// evicts the run from the local buffer (store.unsyncedTaskIds), and the
// static `runs: []` stub above has no way to reflect that the run is now
// "server-side truth" instead. A 503 keeps every run in the local buffer
// for the lifetime of a test, which is what every spec here actually
// assumes when it looks for a just-finished run's detail view.
beforeEach(() => {
  cy.intercept('GET', '/api/prompt-history', { body: { runs: [] } });
  cy.intercept('GET', '/api/audit/health', { body: { elasticsearch: false } });
  cy.intercept('POST', '/api/audit/backfill', {
    statusCode: 503,
    body: { error: 'Elasticsearch is unreachable, backfill will be retried later' },
  });
});

// Auth (Supabase) is off throughout this suite by design, not by accident:
// VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are build-time env vars and CI
// never sets them (see README's CI/CD section — no external services), so
// AuthGate always renders the app directly with no login screen, same as
// a local clone with no Supabase project configured.
