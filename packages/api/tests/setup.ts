import Database from 'better-sqlite3';
import { createTables } from '../src/db/schema.js';

export function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  createTables(db);
  return db;
}

export function seedTestTeam(db: Database.Database, overrides: Partial<Record<string, unknown>> = {}) {
  const team = {
    id: overrides.id ?? 'test-team-1',
    name: overrides.name ?? 'Test Team',
    slug: overrides.slug ?? 'test-team',
    lead: overrides.lead ?? 'Test Lead',
    members: overrides.members ?? 5,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  db.prepare(
    'INSERT INTO teams (id, name, slug, lead, members, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(team.id, team.name, team.slug, team.lead, team.members, team.created_at, team.updated_at);

  return team;
}

export function seedTestStandup(db: Database.Database, overrides: Partial<Record<string, unknown>> = {}) {
  const standup = {
    id: overrides.id ?? 'test-standup-1',
    team_id: overrides.team_id ?? 'test-team-1',
    author: overrides.author ?? 'Test Author',
    date: overrides.date ?? '2024-01-15',
    yesterday: overrides.yesterday ?? 'Did testing',
    today: overrides.today ?? 'More testing',
    blockers: overrides.blockers ?? '',
    mood: overrides.mood ?? 4,
    created_at: '2024-01-15T09:00:00.000Z',
  };

  db.prepare(
    'INSERT INTO standups (id, team_id, author, date, yesterday, today, blockers, mood, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    standup.id, standup.team_id, standup.author, standup.date,
    standup.yesterday, standup.today, standup.blockers, standup.mood, standup.created_at
  );

  return standup;
}

export const TEST_API_KEY = 'default-dev-key-12345';
export const AUTH_HEADER = `Bearer ${TEST_API_KEY}`;
