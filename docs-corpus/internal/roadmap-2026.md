---
title: "Product Roadmap: 2026 Priorities"
sensitivity: internal
category: report
author: "James Park"
date: "2025-Q4"
excerpt: "Planned features and strategic priorities for DataVault in 2026, including multi-tenant policies and advanced agent capabilities."
---

# Product Roadmap: 2026 Priorities

**Status:** Draft — for internal review only. Do not share externally.

## H1 2026: Foundation

### Multi-Tenant Policy Management (Q1)
**Owner:** Platform Squad | **Estimated effort:** 8 weeks

Today, each DataVault instance runs a single policy configuration. In 2026, we will support multi-tenant policies where each organization within a shared deployment can define its own roles, sensitivity levels, and access rules. This is a prerequisite for our planned managed service offering.

### Advanced Agent Capabilities (Q1–Q2)
**Owner:** AI Squad | **Estimated effort:** 12 weeks

Expand the agent orchestration layer to support multi-step workflows, tool chaining, and conditional logic. Agents should be able to execute complex tasks like "find all Q3 reports, summarize financial highlights, and draft a board update" as a single prompt. This requires enhancing the MCP client to support sequential tool invocations with context passing.

### Identity Provider Integration (Q2)
**Owner:** Platform Squad | **Estimated effort:** 6 weeks

Add SAML and OIDC support so enterprise customers can use their existing identity providers. Role mapping will be configurable — customers can map their AD groups to DataVault roles. This eliminates the need for separate credential management.

## H2 2026: Scale

### Batch Document Processing (Q3)
**Owner:** Frontend + Platform | **Estimated effort:** 10 weeks

Support bulk operations: import thousands of documents from S3 or Azure Blob Storage, automatically classify sensitivity levels using AI, and apply organizational metadata. The frontend will include a progress dashboard for monitoring batch jobs.

### Analytics and Reporting (Q3–Q4)
**Owner:** Frontend Squad | **Estimated effort:** 8 weeks

Build an analytics layer on top of the audit log. Dashboards will show access patterns, policy denial trends, agent usage metrics, and document popularity. Export capabilities for compliance teams include PDF reports and CSV data dumps.

### Marketplace for MCP Tools (Q4)
**Owner:** AI Squad | **Estimated effort:** 10 weeks

Create a curated marketplace where customers can discover and install community-built MCP tools. Each tool will be vetted for security and assigned an MRN. Policy rules will automatically extend to cover marketplace tools.

## Resource Allocation

Total engineering headcount for 2026: 55 (up from 42). New hires will be allocated primarily to the Platform Squad (8 hires) and AI Squad (5 hires) to support the expanded roadmap.
