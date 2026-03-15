import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import Database from 'better-sqlite3';
import { createStandupsRouter } from '../../src/routes/standups.js';
import { authMiddleware } from '../../src/middleware/auth.js';
import { createTestDb, seedTestTeam, seedTestStandup, AUTH_HEADER } from '../setup.js';

let db: Database.Database;

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/standups', authMiddleware, createStandupsRouter(db));
  return app;
}

beforeEach(() => {
  db = createTestDb();
  seedTestTeam(db);
});

describe('GET /api/standups', () => {
  it('should return empty array when no standups', async () => {
    const app = createTestApp();
    const res = await request(app)
      .get('/api/standups')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return standups', async () => {
    seedTestStandup(db);
    const app = createTestApp();
    const res = await request(app)
      .get('/api/standups')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('should filter by teamId', async () => {
    seedTestStandup(db);
    const app = createTestApp();

    const res = await request(app)
      .get('/api/standups?teamId=test-team-1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);

    const resEmpty = await request(app)
      .get('/api/standups?teamId=nonexistent')
      .set('Authorization', AUTH_HEADER);

    expect(resEmpty.body).toEqual([]);
  });
});

describe('POST /api/standups', () => {
  it('should create a standup', async () => {
    const app = createTestApp();
    const res = await request(app)
      .post('/api/standups')
      .set('Authorization', AUTH_HEADER)
      .send({
        teamId: 'test-team-1',
        author: 'Test User',
        date: '2024-01-15',
        yesterday: 'Did stuff',
        today: 'Doing more stuff',
        blockers: '',
        mood: 4,
      });

    expect(res.status).toBe(201);
    expect(res.body.author).toBe('Test User');
    expect(res.body.mood).toBe(4);
  });
});

describe('DELETE /api/standups/:id', () => {
  it('should delete a standup', async () => {
    seedTestStandup(db);
    const app = createTestApp();
    const res = await request(app)
      .delete('/api/standups/test-standup-1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(204);
  });
});
