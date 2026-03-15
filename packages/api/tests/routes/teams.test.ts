import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import Database from 'better-sqlite3';
import { createTeamsRouter } from '../../src/routes/teams.js';
import { authMiddleware } from '../../src/middleware/auth.js';
import { createTestDb, seedTestTeam, AUTH_HEADER } from '../setup.js';

let db: Database.Database;

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/teams', authMiddleware, createTeamsRouter(db));
  return app;
}

beforeEach(() => {
  db = createTestDb();
});

describe('GET /api/teams', () => {
  it('should return 401 without auth', async () => {
    const app = createTestApp();
    const res = await request(app).get('/api/teams');
    expect(res.status).toBe(401);
  });

  it('should return empty array when no teams', async () => {
    const app = createTestApp();
    const res = await request(app)
      .get('/api/teams')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return teams', async () => {
    seedTestTeam(db);
    const app = createTestApp();
    const res = await request(app)
      .get('/api/teams')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Test Team');
  });
});

describe('GET /api/teams/:id', () => {
  it('should return 404 for non-existent team', async () => {
    const app = createTestApp();
    const res = await request(app)
      .get('/api/teams/nonexistent')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
  });

  it('should return team by id', async () => {
    seedTestTeam(db);
    const app = createTestApp();
    const res = await request(app)
      .get('/api/teams/test-team-1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('test-team-1');
    expect(res.body.name).toBe('Test Team');
  });
});

describe('POST /api/teams', () => {
  it('should create a team', async () => {
    const app = createTestApp();
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', AUTH_HEADER)
      .send({
        name: 'New Team',
        slug: 'new-team',
        lead: 'Jane Doe',
        members: 5,
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Team');
    expect(res.body.id).toBeDefined();
  });

  it('should return 400 for invalid input', async () => {
    const app = createTestApp();
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', AUTH_HEADER)
      .send({ name: '' });

    expect(res.status).toBe(400);
  });
});
