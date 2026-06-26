describe('Security demo mode — toggle, banner, bypassed events', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/docs*', { fixture: 'doc-list-viewer.json' });
    cy.intercept('GET', '/api/audit/stream', { body: '' });
    cy.visit('/');
  });

  it('security is enabled by default — no warning banner', () => {
    cy.get('[data-testid="security-banner"]').should('not.exist');
    cy.get('[data-testid="security-toggle"]').find('input[role="switch"]').should('be.checked');
  });

  it('toggling security off shows confirmation dialog', () => {
    cy.toggleSecurity(false);
    cy.contains('Disable policy engine?').should('be.visible');
    cy.contains('all AI tool calls').should('be.visible');
  });

  it('cancelling the dialog keeps security enabled', () => {
    cy.toggleSecurity(false);
    cy.get('[data-testid="security-dialog-cancel"]').click();
    cy.get('[data-testid="security-banner"]').should('not.exist');
    cy.get('[data-testid="security-toggle"]').find('input[role="switch"]').should('be.checked');
  });

  it('confirming disables security and shows warning banner', () => {
    cy.toggleSecurity(false);
    cy.get('[data-testid="security-dialog-confirm"]').click();
    cy.get('[data-testid="security-banner"]').should('be.visible');
    cy.contains('POLICY ENGINE DISABLED').should('be.visible');
    cy.get('[data-testid="security-toggle"]').find('input[role="switch"]').should('not.be.checked');
  });

  it('with security off, agent task shows bypassed audit events', () => {
    cy.intercept('POST', '/api/agent/run', {
      headers: { 'content-type': 'text/event-stream' },
      fixture: 'agent-bypassed-stream.txt',
    });

    cy.toggleSecurity(false);
    cy.get('[data-testid="security-dialog-confirm"]').click();

    cy.submitAgentTask('Read all confidential documents');

    cy.contains('Bypassed', { timeout: 10000 }).should('be.visible');
  });

  it('re-enable button in banner restores security', () => {
    cy.toggleSecurity(false);
    cy.get('[data-testid="security-dialog-confirm"]').click();
    cy.get('[data-testid="security-banner"]').should('be.visible');

    cy.get('[data-testid="security-reenable"]').click();
    cy.get('[data-testid="security-banner"]').should('not.exist');
    cy.get('[data-testid="security-toggle"]').find('input[role="switch"]').should('be.checked');
  });
});
