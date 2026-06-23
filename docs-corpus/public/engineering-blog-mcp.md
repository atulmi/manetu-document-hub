---
title: "How We Use the Model Context Protocol in Production"
sensitivity: public
category: blog
author: "Priya Sharma"
date: "2025-Q4"
excerpt: "A technical deep dive into how Acme Corp adopted MCP to let AI agents safely interact with enterprise documents."
---

# How We Use the Model Context Protocol in Production

At Acme Corp, we have been running MCP-based AI agent workflows in production since mid-2025. This post shares what we learned — the architecture decisions, the security considerations, and the practical tradeoffs of letting AI agents interact with real enterprise data.

## Why MCP?

Before MCP, our AI features were bespoke integrations. Each new capability — summarize a document, search the corpus, extract key metrics — required a custom API endpoint, custom prompt engineering, and custom security review. MCP changed this by providing a standard protocol for tool discovery and invocation. An AI agent can discover what tools are available, understand their input schemas, and invoke them through a uniform interface.

## Our Architecture

Our MCP setup has three layers:

1. **MCP Server** — a filesystem-based server that exposes tools like `read-file`, `list-directory`, and `search-files`. Each tool operates on our document corpus and returns structured results.

2. **Policy Engine (MPE)** — sits between the AI agent and the MCP server. Every tool invocation is evaluated against the current user's role and the target resource's sensitivity level. A viewer requesting to read a confidential document gets a deny decision before the tool ever executes.

3. **AI Agent Orchestrator** — manages the conversation loop between Claude and the MCP tools. The orchestrator handles the thinking-tool-call-response cycle, streams results to the frontend via SSE, and logs every step for auditability.

## Security Model

The key insight is that MCP tool access must be governed by the same policies as direct data access. We assign each MCP tool a Manetu Resource Name (MRN) — for example, `mrn:mcp:filesystem:tool:read-file`. Policy rules map user roles to allowed operations on these MRNs.

This means a `developer` role might have full `invoke` permissions on all tools, while a `viewer` role can only invoke `list-directory` and can only `read-file` on documents with `public` sensitivity.

## Lessons Learned

- **Audit everything** — we log every policy decision, not just denials. This builds trust with compliance teams.
- **Stream, don't batch** — SSE streaming lets users see agent reasoning in real time, which builds confidence in AI outputs.
- **Test with fixtures** — our Cypress E2E tests use intercepted API responses, so CI runs without real API keys.

MCP has become the backbone of our AI features. We are excited about the protocol's future and are actively contributing to the ecosystem.
