import type { MCPToolDef } from '../types.ts';

export const TOOL_REGISTRY: MCPToolDef[] = [
  {
    name: 'list-directory',
    mrn: 'mrn:mcp:filesystem:tool:list-directory',
    description: 'List documents in a directory of the document corpus',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string' } },
      required: ['path'],
    },
  },
  {
    name: 'read-file',
    mrn: 'mrn:mcp:filesystem:tool:read-file',
    description: 'Read the full contents of a document from the corpus',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string' } },
      required: ['path'],
    },
  },
  {
    name: 'keyword-search',
    mrn: 'mrn:mcp:docs:tool:keyword-search',
    description: 'Search the document corpus for documents matching a keyword query',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        scope: { type: 'array', items: { type: 'string' } },
      },
      required: ['query', 'scope'],
    },
  },
  {
    name: 'read-public-doc',
    mrn: 'mrn:mcp:docs:resource:public:*',
    description: 'Access to read public-tier documents',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'read-internal-doc',
    mrn: 'mrn:mcp:docs:resource:internal:*',
    description: 'Access to read internal-tier documents',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'read-confidential-doc',
    mrn: 'mrn:mcp:docs:resource:confidential:*',
    description: 'Access to read confidential-tier documents',
    inputSchema: { type: 'object', properties: {} },
  },
];
