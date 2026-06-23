---
title: "Q4 2025 Engineering Team Wiki"
sensitivity: internal
category: wiki
author: "Derek Liu"
date: "2025-Q4"
excerpt: "Engineering team norms, sprint goals, on-call rotation, and meeting schedule for Q4 2025."
---

# Q4 2025 Engineering Team Wiki

## Sprint Goals

Q4 is focused on shipping DataVault 3.0. The engineering team is organized into three squads:

- **Platform Squad** — responsible for the policy engine, MCP server integration, and backend API stability. Key deliverable: sub-50ms policy evaluation latency at P99.
- **Frontend Squad** — building the new React dashboard, role switcher, and real-time audit log panel. Key deliverable: ship the three-panel layout with SSE streaming.
- **AI Squad** — agent orchestration, Claude integration, and MCP tool management. Key deliverable: end-to-end agent task execution with policy enforcement.

Each squad runs two-week sprints with planning on Monday and demos on Friday.

## Team Norms

- **Standups** are asynchronous in Slack (#eng-standup). Post by 10am local time.
- **Code reviews** must be completed within one business day. Use the "needs-review" label.
- **Deploys** happen Tuesday and Thursday via the CI/CD pipeline. Hotfixes can be deployed anytime with on-call approval.
- **Documentation** — every new feature must include updated API docs and a brief entry in the team wiki.

## On-Call Rotation

| Week | Primary | Secondary |
|------|---------|-----------|
| Oct 6–12 | Priya S. | Marcus W. |
| Oct 13–19 | Derek L. | James P. |
| Oct 20–26 | Sarah C. | Lisa T. |
| Oct 27–Nov 2 | Marcus W. | Priya S. |

On-call engineers carry the pager and are expected to acknowledge alerts within 15 minutes. Escalation goes to the engineering manager after 30 minutes of no response.

## Meeting Schedule

- **Monday 10am PT** — Sprint planning (all squads)
- **Wednesday 2pm PT** — Architecture review (rotating presenter)
- **Friday 3pm PT** — Sprint demo and retro

## Useful Links

- Jira board: internal-jira.acme-corp.example.com/board/eng-q4
- Grafana dashboard: grafana.acme-corp.example.com/d/platform-health
- Incident runbook: internal-wiki.acme-corp.example.com/runbooks
