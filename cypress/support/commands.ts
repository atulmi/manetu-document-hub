import type { UserRole } from '../../src/types/index';

declare global {
  namespace Cypress {
    interface Chainable {
      switchRole(role: UserRole): Chainable<void>;
      toggleSecurity(enabled: boolean): Chainable<void>;
      submitAgentTask(prompt: string): Chainable<void>;
      waitForAuditEvent(decision: 'allow' | 'deny'): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('switchRole', (role: UserRole) => {
  cy.get('[data-testid="role-switcher"]').click();
  cy.get(`[data-testid="role-option-${role}"]`).click();
});

Cypress.Commands.add('toggleSecurity', (enabled: boolean) => {
  cy.get('[data-testid="security-toggle"]').then(($toggle) => {
    const isChecked = $toggle.attr('aria-checked') === 'true';
    if (isChecked !== enabled) {
      cy.wrap($toggle).click();
    }
  });
});

Cypress.Commands.add('submitAgentTask', (prompt: string) => {
  cy.get('[data-testid="agent-prompt-input"]').clear().type(prompt);
  cy.get('[data-testid="agent-submit-button"]').click();
});

Cypress.Commands.add('waitForAuditEvent', (decision: 'allow' | 'deny') => {
  return cy.get(`[data-testid="audit-event-${decision}"]`, { timeout: 10000 });
});
