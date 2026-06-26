describe('Smoke test', () => {
  it('loads the app and shows panel titles', () => {
    cy.visit('/');
    cy.contains('Manetu AI Document Hub').should('be.visible');
    cy.contains('Document Library').should('be.visible');
    cy.contains('Agent Task View').should('be.visible');
    cy.contains('Prompt History').should('be.visible');
  });

  it('shows suggestion chips', () => {
    cy.visit('/');
    cy.contains('Try asking').should('be.visible');
    cy.contains('List all public documents available').should('be.visible');
  });

  it('shows empty state in prompt history', () => {
    cy.visit('/');
    cy.contains('No prompt runs yet').should('be.visible');
  });
});
