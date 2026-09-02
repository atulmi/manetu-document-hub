import './commands';

// Every spec renders the Prompt History panel, which fetches these on
// mount/interval regardless of what the spec itself is testing. Stub them
// globally so specs don't each need to know about the Elasticsearch-backed
// history feature (see ISSUE-030) unless they're specifically testing it.
beforeEach(() => {
  cy.intercept('GET', '/api/prompt-history', { body: { runs: [] } });
  cy.intercept('GET', '/api/audit/health', { body: { elasticsearch: false } });
});
