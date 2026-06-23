// Direct filesystem implementation of MCP tools.
// TODO: replace with MCP stdio client when MCP SDK stdio transport is stable.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import type { DocMeta, DocSensitivity } from '../types.ts';

const DOCS_ROOT = process.env['MCP_DOCS_PATH'] ?? './docs-corpus';

interface DocFrontmatter {
  title?: string;
  sensitivity?: DocSensitivity;
  excerpt?: string;
}

async function walkMarkdown(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const paths: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      paths.push(...await walkMarkdown(full));
    } else if (entry.name.endsWith('.md')) {
      paths.push(full);
    }
  }
  return paths;
}

async function parseDocMeta(filePath: string): Promise<DocMeta> {
  const raw = await readFile(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const fm = data as DocFrontmatter;
  const relPath = relative(DOCS_ROOT, filePath).replace(/\\/g, '/');
  const stats = await stat(filePath);

  return {
    id: relPath.replace(/[/.]/g, '-'),
    title: fm.title ?? relPath,
    path: relPath,
    sensitivity: fm.sensitivity ?? 'public',
    excerpt: fm.excerpt ?? content.slice(0, 120).replace(/\n/g, ' ').trim(),
    sizeBytes: stats.size,
  };
}

export class MCPFilesystemClient {
  private docsRoot: string;

  constructor(docsRoot?: string) {
    this.docsRoot = docsRoot ?? DOCS_ROOT;
  }

  async listDirectory(dirPath: string = '.'): Promise<DocMeta[]> {
    const absDir = join(this.docsRoot, dirPath);
    const files = await walkMarkdown(absDir);
    return Promise.all(files.map(parseDocMeta));
  }

  async readFile(filePath: string): Promise<string> {
    const absPath = join(this.docsRoot, filePath);
    return readFile(absPath, 'utf-8');
  }

  async keywordSearch(query: string, scope: DocSensitivity[]): Promise<DocMeta[]> {
    const allDocs = await this.listDirectory('.');
    const scopedDocs = allDocs.filter((d) => scope.includes(d.sensitivity));
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored: { doc: DocMeta; score: number }[] = [];
    for (const doc of scopedDocs) {
      const content = await this.readFile(doc.path);
      const haystack = (doc.title + ' ' + content).toLowerCase();
      let score = 0;
      for (const word of words) {
        const re = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = haystack.match(re);
        if (matches) score += matches.length;
      }
      if (score > 0) scored.push({ doc, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.doc);
  }
}

export function buildFSClient(docsRoot?: string): MCPFilesystemClient {
  return new MCPFilesystemClient(docsRoot);
}
