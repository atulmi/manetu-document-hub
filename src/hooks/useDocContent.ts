import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export function useDocContent(docPath: string | null) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!docPath) {
      setContent(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const encoded = btoa(docPath).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    apiFetch<{ content: string }>(`/docs/content/${encoded}`)
      .then((data) => {
        if (!cancelled) setContent(data.content);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load document');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [docPath]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { content, loading, error };
}
