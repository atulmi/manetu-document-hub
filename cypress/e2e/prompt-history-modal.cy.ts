describe("Prompt history — filters popover and historical run modal", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/docs*", { fixture: "doc-list-viewer.json" });
    cy.intercept("GET", "/api/audit/stream", { body: "" });
    cy.intercept("GET", "/api/prompt-history", {
      fixture: "prompt-history-list.json",
    }).as("getHistory");
    cy.visit("/");
    cy.wait("@getHistory");
  });

  it("lists historical runs from the Elasticsearch-backed history endpoint", () => {
    cy.contains("What is our Q3 revenue?").should("be.visible");
    cy.contains("List all confidential documents").should("be.visible");
  });

  it("Filters button opens a popover with role/status/decision selects", () => {
    cy.contains("button", "Filters").click();
    cy.contains("User role").should("be.visible");
    cy.contains("Job status").should("be.visible");
    cy.contains("Policy decision").should("be.visible");
  });

  it("selecting a role filter narrows the list and shows an active count", () => {
    cy.contains("button", "Filters").click();
    cy.get('[aria-label="Filter by user role"]').click();
    cy.get('li[role="option"]').contains("developer").click();

    cy.contains("button", "Filters (1)").should("be.visible");
    cy.contains("What is our Q3 revenue?").should("be.visible");
    cy.contains("List all confidential documents").should("not.exist");
  });

  it("Reset filters restores the full list", () => {
    cy.contains("button", "Filters").click();
    cy.get('[aria-label="Filter by user role"]').click();
    cy.get('li[role="option"]').contains("developer").click();

    cy.contains("button", "Filters (1)").click();
    cy.contains("button", "Reset filters").click();

    cy.contains("List all confidential documents").should("be.visible");
  });

  it("clicking a historical run opens it in a modal with a step sidebar", () => {
    cy.intercept("GET", "/api/prompt-history/hist-task-1", {
      fixture: "prompt-run-detail.json",
    }).as("getDetail");

    cy.contains("What is our Q3 revenue?").click();
    cy.wait("@getDetail");

    cy.get('[role="dialog"]').within(() => {
      cy.contains("What is our Q3 revenue?").should("be.visible");
      cy.contains("Step 1").should("be.visible");
      cy.contains("Step 2").should("be.visible");
      cy.contains("Tool Call").should("be.visible");
      cy.contains("Final Answer").should("be.visible");
    });
  });

  it("jumping to a step from the sidebar scrolls it into view", () => {
    cy.intercept("GET", "/api/prompt-history/hist-task-1", {
      fixture: "prompt-run-detail.json",
    });

    cy.contains("What is our Q3 revenue?").click();
    cy.contains("Final Answer", { timeout: 10000 }).should("exist");

    cy.get('[role="dialog"]').within(() => {
      cy.contains("Step 1").click();
      cy.get("#step-1").should("be.visible");
    });
  });

  it("closing the modal returns to the prompt history list", () => {
    cy.intercept("GET", "/api/prompt-history/hist-task-1", {
      fixture: "prompt-run-detail.json",
    });

    cy.contains("What is our Q3 revenue?").click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[role="dialog"]').find('[data-testid="run-detail-back-button"]').click();

    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("What is our Q3 revenue?").should("be.visible");
  });
});
