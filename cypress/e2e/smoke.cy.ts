describe('Smoke test', () => {
  it('loads the app and shows the title', () => {
    cy.visit('/');
    cy.contains('Document').should('be.visible');
  });
});
