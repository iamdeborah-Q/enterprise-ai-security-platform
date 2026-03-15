import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import healthRouter from '../../src/routes/health.js';

function createTestApp() {
  const app = express();
  app.use(healthRouter);
  return app;
}

describe('GET /health', () => {
  it('should return status ok', async () => {
    const app = createTestApp();
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBe('1.0.0');
    expect(typeof res.body.uptime).toBe('number');
  });
});
