---
title: "Our Approach to Data Security"
sensitivity: public
category: wiki
author: "Marcus Williams"
date: "2025-Q4"
excerpt: "Frequently asked questions about how Acme Corp secures customer data, manages access control, and handles compliance."
---

# Our Approach to Data Security

## Frequently Asked Questions

### How is data encrypted?

All data at rest is encrypted using AES-256-GCM. Data in transit is protected with TLS 1.3. Encryption keys are managed through a dedicated key management service with automatic rotation every 90 days. Customers on our Enterprise tier can bring their own encryption keys (BYOK) for additional control.

### How does access control work?

DataVault uses the Manetu Policy Engine (MPE) to evaluate every access request in real time. Access control is role-based with five default roles: developer, data-analyst, viewer, auditor, and admin. Each role has a defined set of permissions that determine which documents and tools they can access.

Policy rules are written in a declarative format and evaluated against the user's role, the target resource's sensitivity level, and the requested operation. For example, a rule might state: "viewers can read documents with public sensitivity but cannot access internal or confidential documents."

### What about AI agent access?

AI agents in DataVault 3.0 operate under the same access control policies as human users. When an agent invokes an MCP tool, the request is evaluated by the policy engine before execution. If the policy denies the request, the agent receives an access denied error and must adjust its approach. All agent actions are logged in the audit trail.

### How is activity audited?

Every access request — whether from a human user or an AI agent — generates an audit event. Audit events include the timestamp, the requesting principal (user role), the target resource, the requested operation, and the policy decision (allow, deny, or bypassed). Administrators can view audit events in real time through the security dashboard or export them for compliance reporting.

### Do you perform security audits?

Yes. We conduct external penetration testing annually through an independent security firm. Findings are tracked through remediation and verified in follow-up assessments. We also maintain SOC 2 Type II compliance and provide audit reports to Enterprise customers upon request.

### How do I report a security issue?

Please email security@acme-corp.example.com with details of the issue. We follow responsible disclosure practices and aim to acknowledge all reports within 24 hours.
