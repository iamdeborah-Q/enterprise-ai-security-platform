import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import Database from 'better-sqlite3';
import { createDigestRouter } from '../../src/routes/digest.js';
import { authMiddleware } from '../../src/middleware/auth.js';
import { daysAgo } from '../../src/utils/dateUtils.js';
import { createTestDb, seedTestTeam, seedTestStandup, AUTH_HEADER } from '../setup.js';

let db: Database.Database;

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/digest', authMiddleware, createDigestRouter(db));
  return app;
}

beforeEach(() => {
  db = createTestDb();
});

describe('GET /api/digest', () => {
  it('should return 401 without auth', async () => {
    const app = createTestApp();
    const res = await request(app).get('/api/digest');
    expect(res.status).toBe(401);
  });

  it('should return an empty team list when there are no teams', async () => {
    const app = createTestApp();
    const res = await request(app).get('/api/digest').set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.error).toBeNull();
    expect(res.body.data.teams).toEqual([]);
    expect(res.body.meta.teamCount).toBe(0);
  });

  it('should group recent standups by team with avg mood and blocker count', async () => {
    seedTestTeam(db);
    seedTestStandup(db, { id: 's1', date: daysAgo(1), mood: 4, blockers: '' });
    seedTestStandup(db, { id: 's2', date: daysAgo(3), mood: 2, blockers: 'API is down' });

    const app = createTestApp();
    const res = await request(app).get('/api/digest').set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.teams).toHaveLength(1);

    const team = res.body.data.teams[0];
    expect(team.teamId).toBe('test-team-1');
    expect(team.teamName).toBe('Test Team');
    expect(team.standups).toHaveLength(2);
    expect(team.avgMood).toBe(3);
    expect(team.blockerCount).toBe(1);
  });

  it('should exclude standups older than 7 days', async () => {
    seedTestTeam(db);
    seedTestStandup(db, { id: 'recent', date: daysAgo(2), mood: 5, blockers: '' });
    seedTestStandup(db, { id: 'old', date: daysAgo(10), mood: 1, blockers: 'stale blocker' });

    const app = createTestApp();
    const res = await request(app).get('/api/digest').set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    const team = res.body.data.teams[0];
    expect(team.standups).toHaveLength(1);
    expect(team.standups[0].id).toBe('recent');
    expect(team.avgMood).toBe(5);
    expect(team.blockerCount).toBe(0);
  });

  it('should report zero values for a team with no recent standups', async () => {
    seedTestTeam(db);

    const app = createTestApp();
    const res = await request(app).get('/api/digest').set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    const team = res.body.data.teams[0];
    expect(team.standups).toEqual([]);
    expect(team.avgMood).toBe(0);
    expect(team.blockerCount).toBe(0);
  });
});
