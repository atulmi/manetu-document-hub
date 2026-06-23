---
title: "Introducing DataVault 3.0"
sensitivity: public
category: blog
author: "James Park"
date: "2025-Q4"
excerpt: "DataVault 3.0 brings AI-native document workflows, real-time policy evaluation, and a redesigned dashboard."
---

# Introducing DataVault 3.0

We are thrilled to announce the general availability of **DataVault 3.0**, the most significant release in our product's history. This version represents a fundamental shift in how organizations interact with their documents — moving from passive storage to active, AI-powered document intelligence.

## What's New

### AI-Native Document Workflows

DataVault 3.0 introduces first-class support for AI agents through the Model Context Protocol (MCP). AI agents can now browse, search, and summarize documents within your corpus — all while respecting your organization's access policies. Every agent action is evaluated by the Manetu Policy Engine in real time, ensuring that a viewer-role agent cannot access confidential financial documents even if explicitly instructed to do so.

### Real-Time Policy Dashboard

The new security dashboard provides a live view of every policy decision as it happens. Administrators can watch agent interactions in real time, see which tools are being invoked, and review allow/deny decisions with full context including the policy rule that triggered each decision.

### Redesigned User Interface

We rebuilt the frontend from the ground up using React and Material UI. The new interface features a three-panel layout: document browser on the left, agent interaction in the center, and a live audit log on the right. Role switching lets administrators instantly preview what different user roles can see and access.

## Pricing

DataVault 3.0 is available in three tiers:

- **Starter** — $499/month — up to 10,000 documents, 5 user roles, basic audit logging
- **Professional** — $1,499/month — unlimited documents, custom policies, AI agent support, full audit trail
- **Enterprise** — custom pricing — dedicated infrastructure, SLA guarantees, premium support, SSO integration

## Availability

DataVault 3.0 is available today for all existing Professional and Enterprise customers. Starter tier customers will be upgraded automatically over the next two weeks. New customers can sign up for a 30-day free trial on our website.

## What's Next

We are already working on DataVault 3.1, which will include batch document processing, enhanced MCP tool permissions, and integration with popular identity providers. Stay tuned to our blog for updates.
