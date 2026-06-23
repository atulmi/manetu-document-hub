import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../lib/store';
import { apiFetch } from '../lib/api';
import type { DocMeta } from '../types';

interface DocMetaWithAccess extends DocMeta {
  accessible: boolean;
}

export function useDocLibrary() {
  const [docs, setDocs] = useState<DocMetaWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetchTrigger = useStore((s) => s.refetchTrigger);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<DocMetaWithAccess[]>('/docs');
      setDocs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs, refetchTrigger]);

  return { docs, loading, error, refetch: fetchDocs };
}
