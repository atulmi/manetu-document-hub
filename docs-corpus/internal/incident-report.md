---
title: "Incident Review: Nov 2025 Outage"
sensitivity: internal
category: report
author: "Priya Sharma"
date: "2025-Q4"
excerpt: "Postmortem analysis of the November 12, 2025 platform outage including root cause, timeline, and action items."
---

# Incident Review: Nov 2025 Outage

**Incident ID:** INC-2025-042
**Severity:** P1
**Duration:** 2 hours 17 minutes (07:43 UTC – 10:00 UTC)
**Impact:** All DataVault Cloud customers experienced intermittent 503 errors on document read and agent task endpoints.

## Summary

On November 12, 2025, a configuration change to the policy engine's caching layer caused a cascading failure that resulted in elevated error rates across the platform. The root cause was a misconfigured TTL value that caused the cache to evict all entries simultaneously, creating a thundering herd against the policy evaluation service.

## Timeline

- **07:30 UTC** — Deploy of policy-engine v2.14.3 including cache TTL optimization (changed from random jitter to fixed 60s)
- **07:43 UTC** — Monitoring alerts fire: policy evaluation P99 latency exceeds 500ms (threshold: 200ms)
- **07:45 UTC** — On-call engineer Derek L. acknowledges alert, begins investigation
- **07:52 UTC** — Error rate crosses 15%. Customer-facing 503 responses begin appearing
- **08:10 UTC** — Root cause identified: all cache entries expire at the same wall-clock second, causing synchronized thundering herd
- **08:25 UTC** — Rollback initiated to policy-engine v2.14.2
- **08:40 UTC** — Rollback complete but cache needs time to warm
- **09:15 UTC** — Error rate drops below 1%
- **10:00 UTC** — All metrics return to normal. Incident declared resolved

## Root Cause

The cache TTL was changed from a random jitter of 55–65 seconds to a fixed 60 seconds. This caused all cache entries created within the same second to expire simultaneously. Under normal load, the policy engine handles approximately 3,000 evaluations per second. When the cache emptied, all requests hit the backing policy store simultaneously, overwhelming it and causing timeout cascades.

## Action Items

| Item | Owner | Status | Deadline |
|------|-------|--------|----------|
| Restore random jitter on cache TTL | Derek L. | Complete | Nov 13 |
| Add cache hit rate metric to dashboard | Marcus W. | In progress | Nov 20 |
| Load test cache eviction scenarios | Priya S. | Not started | Dec 1 |
| Add deploy canary for policy engine | Platform Squad | Not started | Dec 15 |
| Update runbook with cache failure playbook | Derek L. | Complete | Nov 15 |

## Lessons Learned

1. Cache behavior changes should be treated as high-risk deploys requiring canary rollout
2. Fixed TTL values are dangerous in high-throughput systems — always use jitter
3. Our rollback process worked well but cache warming time added 35 minutes to recovery
