import type { UserRole } from '../../src/types/index';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      switchRole(role: UserRole): Chainable<void>;
      toggleSecurity(enabled: boolean): Chainable<void>;
      submitAgentTask(prompt: string): Chainable<void>;
      waitForAuditEvent(decision: 'allow' | 'deny' | 'bypassed'): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('switchRole', (role: UserRole) => {
  cy.get('[data-testid="role-switcher"]').find('[role="combobox"]').click();
  cy.get(`[data-testid="role-option-${role}"]`).click();
});

Cypress.Commands.add('toggleSecurity', (enabled: boolean) => {
  cy.get('[data-testid="security-toggle"]').find('input[role="switch"]').then(($switch) => {
    const isChecked = $switch.is(':checked');
    if (isChecked !== enabled) {
      cy.get('[data-testid="security-toggle"]').find('input[role="switch"]').click({ force: true });
    }
  });
});

Cypress.Commands.add('submitAgentTask', (prompt: string) => {
  cy.get('[data-testid="agent-prompt-input"]').find('textarea').first().clear().type(prompt);
  cy.get('[data-testid="agent-submit-button"]').click();
});

Cypress.Commands.add('waitForAuditEvent', (decision: 'allow' | 'deny' | 'bypassed') => {
  return cy.get(`[data-testid="audit-event-${decision}"]`, { timeout: 10000 });
});
