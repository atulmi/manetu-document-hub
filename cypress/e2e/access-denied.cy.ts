describe('Access denied — viewer sees restricted content', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/docs*', { fixture: 'doc-list-viewer.json' });
    cy.intercept('GET', '/api/audit/stream', { body: '' });
    cy.visit('/');
  });

  it('clicking a locked doc shows access restriction warning', () => {
    cy.contains('Internal').should('be.visible');
  });

  it('viewer agent task results in denied audit events', () => {
    cy.intercept('POST', '/api/agent/run', {
      headers: { 'content-type': 'text/event-stream' },
      fixture: 'agent-denied-stream.txt',
    });

    cy.submitAgentTask('What is the Q3 revenue forecast?');

    cy.contains('Denied', { timeout: 10000 }).should('be.visible');
  });

  it('denied tool call shows the error message', () => {
    cy.intercept('POST', '/api/agent/run', {
      headers: { 'content-type': 'text/event-stream' },
      fixture: 'agent-denied-stream.txt',
    });

    cy.submitAgentTask('What is the Q3 revenue forecast?');

    cy.contains('Access denied by policy engine', { timeout: 10000 }).should('be.visible');
  });

  it('final answer explains the restriction', () => {
    cy.intercept('POST', '/api/agent/run', {
      headers: { 'content-type': 'text/event-stream' },
      fixture: 'agent-denied-stream.txt',
    });

    cy.submitAgentTask('What is the Q3 revenue forecast?');

    cy.contains('restricted for the viewer role', { timeout: 10000 }).should('be.visible');
  });
});
