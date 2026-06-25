describe('Role switcher updates document library', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/docs*', { fixture: 'doc-list-viewer.json' }).as('getDocs');
    cy.intercept('GET', '/api/audit/stream', { body: '' });
    cy.visit('/');
    cy.wait('@getDocs');
  });

  it('viewer role — public docs are accessible', () => {
    cy.contains('Public').should('be.visible');
    cy.contains('Acme Corp').should('be.visible');
  });

  it('switching from viewer to admin triggers doc refetch', () => {
    cy.intercept('GET', '/api/docs*', { fixture: 'doc-list-analyst.json' }).as('getDocsAnalyst');
    cy.switchRole('data-analyst');
    cy.wait('@getDocsAnalyst');
  });

  it('role switcher shows the selected role name', () => {
    cy.get('[data-testid="role-switcher"]').should('contain.text', 'Viewer');
  });

  it('switching role shows toast notification', () => {
    cy.intercept('GET', '/api/docs*', { fixture: 'doc-list-analyst.json' });
    cy.switchRole('data-analyst');
    cy.contains('Switched to Data Analyst').should('be.visible');
  });
});
