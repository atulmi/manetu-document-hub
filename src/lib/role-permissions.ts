import type { UserRole } from '../types';

export interface RolePermissions {
  docs: { public: boolean; internal: boolean; confidential: boolean };
  tools: { 'list-directory': boolean; 'read-file': boolean; 'keyword-search': boolean };
}

export const ROLE_COLORS: Record<UserRole, string> = {
  viewer: '#29b6f6',
  developer: '#6366f1',
  'data-analyst': '#6366f1',
  auditor: '#f59e0b',
  admin: '#ef4444',
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  viewer: {
    docs: { public: true, internal: false, confidential: false },
    tools: { 'list-directory': true, 'read-file': false, 'keyword-search': false },
  },
  developer: {
    docs: { public: true, internal: true, confidential: false },
    tools: { 'list-directory': true, 'read-file': true, 'keyword-search': true },
  },
  'data-analyst': {
    docs: { public: true, internal: true, confidential: false },
    tools: { 'list-directory': true, 'read-file': true, 'keyword-search': true },
  },
  auditor: {
    docs: { public: true, internal: true, confidential: true },
    tools: { 'list-directory': true, 'read-file': true, 'keyword-search': false },
  },
  admin: {
    docs: { public: true, internal: true, confidential: true },
    tools: { 'list-directory': true, 'read-file': true, 'keyword-search': true },
  },
};
