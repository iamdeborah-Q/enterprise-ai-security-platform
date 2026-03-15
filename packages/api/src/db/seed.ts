import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './schema.js';
import { daysAgo, nowISO } from '../utils/dateUtils.js';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './data/teampulse.db';
const dir = path.dirname(dbPath);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = getDb(dbPath);

// Clear existing data
db.exec('DELETE FROM standups');
db.exec('DELETE FROM teams');

// Seed teams
const teams = [
  { id: uuidv4(), name: 'Platform Engineering', slug: 'platform-engineering', lead: 'Alice Chen', members: 8 },
  { id: uuidv4(), name: 'Product', slug: 'product', lead: 'Bob Martinez', members: 12 },
  { id: uuidv4(), name: 'Data Science', slug: 'data-science', lead: 'Carol Williams', members: 6 },
];

const insertTeam = db.prepare(
  'INSERT INTO teams (id, name, slug, lead, members, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

const now = nowISO();
for (const team of teams) {
  insertTeam.run(team.id, team.name, team.slug, team.lead, team.members, now, now);
}

console.log(`Seeded ${teams.length} teams`);

// Seed standups
const authors: Record<string, string[]> = {
  [teams[0].id]: ['Alice Chen', 'Dave Park', 'Eve Johnson', 'Frank Lee'],
  [teams[1].id]: ['Bob Martinez', 'Grace Kim', 'Hank Brown', 'Ivy Davis'],
  [teams[2].id]: ['Carol Williams', 'Jack Wilson', 'Kate Taylor'],
};

const blockerOptions = [
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  'Waiting on API access from external team',
  'Staging environment down since yesterday',
  'Blocked on design review approval',
  'CI pipeline failing intermittently',
  'Need credentials for third-party service',
  'Waiting on PM to clarify requirements',
  'Database migration needs DBA approval',
];

const yesterdayOptions = [
  'Worked on API endpoint refactoring',
  'Fixed authentication bug in login flow',
  'Reviewed pull requests from team members',
  'Set up monitoring dashboards',
  'Wrote unit tests for user service',
  'Deployed hotfix to production',
  'Attended sprint planning meeting',
  'Optimized database queries for reports',
  'Investigated memory leak in worker service',
  'Updated documentation for onboarding',
];

const todayOptions = [
  'Continue working on feature branch',
  'Start integration testing',
  'Code review and pair programming session',
  'Deploy new version to staging',
  'Write migration scripts for schema update',
  'Set up alerting for new service',
  'Performance testing for search feature',
  'Refactor authentication middleware',
  'Work on dashboard UI components',
  'Bug triage and prioritization',
];

const insertStandup = db.prepare(
  'INSERT INTO standups (id, team_id, author, date, yesterday, today, blockers, mood, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

function weightedMood(): number {
  const r = Math.random();
  if (r < 0.05) return 1;
  if (r < 0.15) return 2;
  if (r < 0.45) return 3;
  if (r < 0.80) return 4;
  return 5;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let standupCount = 0;
for (const team of teams) {
  const teamAuthors = authors[team.id];
  for (let i = 0; i < 10; i++) {
    const date = daysAgo(Math.floor(Math.random() * 14));
    const author = pick(teamAuthors);
    const standup = {
      id: uuidv4(),
      teamId: team.id,
      author,
      date,
      yesterday: pick(yesterdayOptions),
      today: pick(todayOptions),
      blockers: pick(blockerOptions),
      mood: weightedMood(),
      createdAt: nowISO(),
    };
    insertStandup.run(
      standup.id, standup.teamId, standup.author, standup.date,
      standup.yesterday, standup.today, standup.blockers, standup.mood, standup.createdAt
    );
    standupCount++;
  }
}

console.log(`Seeded ${standupCount} standups`);
db.close();
console.log('Seed complete!');
