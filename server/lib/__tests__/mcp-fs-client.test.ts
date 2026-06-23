import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { MCPFilesystemClient } from '../mcp-fs-client.ts';

const CORPUS = resolve(import.meta.dirname ?? '.', '../../../docs-corpus');
const client = new MCPFilesystemClient(CORPUS);

describe('MCPFilesystemClient.listDirectory', () => {
  it('returns all 15 docs when listing root', async () => {
    const docs = await client.listDirectory('.');
    expect(docs.length).toBe(15);
  });

  it('returns only public docs when listing public/', async () => {
    const docs = await client.listDirectory('public');
    expect(docs.length).toBe(5);
    for (const doc of docs) {
      expect(doc.sensitivity).toBe('public');
    }
  });

  it('parses frontmatter correctly', async () => {
    const docs = await client.listDirectory('confidential');
    const financials = docs.find((d) => d.path.includes('q3-financials'));
    expect(financials).toBeDefined();
    expect(financials!.sensitivity).toBe('confidential');
    expect(financials!.title).toBe('Q3 2025 Financial Summary');
    expect(financials!.sizeBytes).toBeGreaterThan(0);
  });
});

describe('MCPFilesystemClient.readFile', () => {
  it('returns full markdown content', async () => {
    const content = await client.readFile('public/company-overview.md');
    expect(content).toContain('Acme Corp');
    expect(content).toContain('---');
  });
});

describe('MCPFilesystemClient.keywordSearch', () => {
  it('returns revenue-related docs sorted by relevance', async () => {
    const results = await client.keywordSearch('revenue', ['public', 'internal', 'confidential']);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].path).toContain('q3-financials');
  });

  it('returns security docs across tiers', async () => {
    const results = await client.keywordSearch('security', ['public', 'confidential']);
    const paths = results.map((d) => d.path);
    expect(paths.some((p) => p.includes('security-faq'))).toBe(true);
    expect(paths.some((p) => p.includes('security-audit'))).toBe(true);
  });

  it('respects scope filter', async () => {
    const results = await client.keywordSearch('revenue', ['public']);
    for (const doc of results) {
      expect(doc.sensitivity).toBe('public');
    }
  });

  it('returns empty for no matches', async () => {
    const results = await client.keywordSearch('xyznonexistent', ['public']);
    expect(results).toEqual([]);
  });
});
