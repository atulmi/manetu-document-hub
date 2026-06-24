import { useState, useEffect, useCallback, useRef } from 'react';
import type { AuditEvent } from '../types';

const MAX_EVENTS = 200;
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

export function useAuditStream() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const retriesRef = useRef(0);
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    const es = new EventSource('/api/audit/stream');
    esRef.current = es;

    es.addEventListener('open', () => {
      setConnected(true);
      retriesRef.current = 0;
    });

    es.addEventListener('audit', (e) => {
      try {
        const event = JSON.parse(e.data) as AuditEvent;
        setEvents((prev) => {
          const next = [event, ...prev];
          return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
        });
      } catch {
        // skip malformed events
      }
    });

    es.addEventListener('error', () => {
      es.close();
      setConnected(false);

      if (retriesRef.current < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, retriesRef.current);
        retriesRef.current++;
        setTimeout(connect, delay);
      }
    });
  }, []);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connect]);

  const clear = useCallback(() => setEvents([]), []);

  return { events, connected, clear };
}
