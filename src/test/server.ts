import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const handlers = [
  http.get('/api/tools', () => {
    return HttpResponse.json([]);
  }),
  http.post('/api/agent/run', () => {
    return new HttpResponse(null, { status: 501 });
  }),
  http.get('/api/audit/stream', () => {
    return new HttpResponse(null, { status: 501 });
  }),
];

export const server = setupServer(...handlers);
