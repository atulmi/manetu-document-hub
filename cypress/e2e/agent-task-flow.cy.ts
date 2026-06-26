describe('Agent task flow — submit, steps appear, final answer', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/docs*', { fixture: 'doc-list-viewer.json' });
    cy.intercept('GET', '/api/audit/stream', { body: '' });
    cy.intercept('POST', '/api/agent/run', {
      headers: { 'content-type': 'text/event-stream' },
      fixture: 'agent-happy-path-stream.txt',
    }).as('agentRun');
    cy.visit('/');
  });

  it('submitting a prompt shows thinking card', () => {
    cy.submitAgentTask('What documents do I have access to?');
    cy.contains('Thinking', { timeout: 10000 }).should('be.visible');
  });

  it('tool call step appears with Allowed badge', () => {
    cy.submitAgentTask('What documents do I have access to?');
    cy.contains('Tool Call', { timeout: 10000 }).should('be.visible');
    cy.contains('Allowed').should('be.visible');
    cy.contains('list-directory').should('be.visible');
  });

  it('final answer card appears with content', () => {
    cy.submitAgentTask('What documents do I have access to?');
    cy.contains('Final Answer', { timeout: 10000 }).should('be.visible');
    cy.contains('Based on the available documents').should('be.visible');
  });

  it('task input is disabled while running', () => {
    cy.submitAgentTask('What documents do I have access to?');
    cy.get('[data-testid="agent-prompt-input"]').find('textarea').first().should('be.disabled');
  });

  it('task input re-enables after completion', () => {
    cy.submitAgentTask('What documents do I have access to?');
    cy.contains('Final Answer', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="agent-prompt-input"]').find('textarea').first().should('not.be.disabled');
  });

  it('prompt appears in prompt history after completion', () => {
    cy.submitAgentTask('What documents do I have access to?');
    cy.contains('Final Answer', { timeout: 10000 }).should('be.visible');
    // Back button returns to prompt history list
    cy.get('button').find('svg[data-testid="ArrowBackIcon"]').click();
    cy.contains('What documents do I have access to?').should('be.visible');
  });

  it('re-run button is visible in prompt history row', () => {
    cy.submitAgentTask('What documents do I have access to?');
    cy.contains('Final Answer', { timeout: 10000 }).should('be.visible');
    cy.get('button').find('svg[data-testid="ArrowBackIcon"]').click();
    cy.get('svg[data-testid="ReplayIcon"]').should('be.visible');
  });
});
