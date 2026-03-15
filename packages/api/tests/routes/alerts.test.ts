import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../../src/index.js';
import { createTestDb, seedTestTeam, seedTestStandup, AUTH_HEADER } from '../setup.js';

let db: Database.Database;
let app: ReturnType<typeof createApp>;

function recentDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function seedLowMoodStandups(db: Database.Database, teamId: string) {
  for (let i = 1; i <= 3; i++) {
    seedTestStandup(db, {
      id: `standup-${i}`,
      team_id: teamId,
      date: recentDate(i),
      mood: 2,
    });
  }
}

beforeEach(() => {
  db = createTestDb();
  app = createApp(db);
});

describe('GET /api/alerts', () => {
  it('should return 401 without auth', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(401);
  });

  it('should return empty array when no alerts', async () => {
    seedTestTeam(db);
    const res = await request(app)
      .get('/api/alerts')
      .set('Authorization', AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return alerts when conditions are met', async () => {
    seedTestTeam(db);
    seedLowMoodStandups(db, 'test-team-1');

    const res = await request(app)
      .get('/api/alerts')
      .set('Authorization', AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].teamId).toBe('test-team-1');
    expect(res.body[0].severity).toBe('warning');
  });
});

describe('GET /api/alerts/:teamId', () => {
  it('should return null when no alert for team', async () => {
    seedTestTeam(db);
    const res = await request(app)
      .get('/api/alerts/test-team-1')
      .set('Authorization', AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it('should return alert when conditions are met', async () => {
    seedTestTeam(db);
    seedLowMoodStandups(db, 'test-team-1');

    const res = await request(app)
      .get('/api/alerts/test-team-1')
      .set('Authorization', AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body.teamId).toBe('test-team-1');
    expect(res.body.severity).toBe('warning');
    expect(res.body.alertDates).toHaveLength(3);
  });
});
