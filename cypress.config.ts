import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
    screenshotOnRunFailure: true,
    // A safety net for genuine timing flakiness, not a substitute for
    // fixing root causes — see README's Testing section. openMode stays
    // at 0 (no silent retries while actively developing a spec locally).
    retries: { runMode: 2, openMode: 0 },
  },
});
