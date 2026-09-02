// Prompt run summary, now backed by Elasticsearch via GET /api/prompt-history
// (see src/hooks/usePromptHistory.ts) rather than derived from localStorage.
// Re-exported under the existing name to avoid churning every import site.
export type { PromptRunSummary as PromptGroup } from '../../types';
