import Database from 'better-sqlite3';
import { Standup, TeamDigest, WeeklyDigest } from '../types/index.js';
import { daysAgo, nowISO } from '../utils/dateUtils.js';

function rowToStandup(row: Record<string, unknown>): Standup {
  return {
    id: row.id as string,
    teamId: row.team_id as string,
    author: row.author as string,
    date: row.date as string,
    yesterday: row.yesterday as string,
    today: row.today as string,
    blockers: row.blockers as string,
    mood: row.mood as 1 | 2 | 3 | 4 | 5,
    createdAt: row.created_at as string,
  };
}

export class DigestService {
  constructor(private db: Database.Database) {}

  /**
   * Build a weekly digest of standups from the past 7 days, grouped by team.
   * Each team includes its standups plus an average mood and blocker count.
   */
  getWeeklyDigest(): WeeklyDigest {
    const since = daysAgo(7);
    const teams = this.db.prepare('SELECT id, name FROM teams ORDER BY name').all() as Array<{
      id: string;
      name: string;
    }>;

    const teamDigests = teams.map((team) => this.getTeamDigest(team.id, team.name, since));

    return {
      generatedAt: nowISO(),
      since,
      teams: teamDigests,
    };
  }

  private getTeamDigest(teamId: string, teamName: string, since: string): TeamDigest {
    const rows = this.db
      .prepare(
        `SELECT * FROM standups
         WHERE team_id = ? AND date >= ?
         ORDER BY date DESC, created_at DESC`
      )
      .all(teamId, since);

    const standups = rows.map((row) => rowToStandup(row as Record<string, unknown>));

    const avgMood = standups.length
      ? Math.round((standups.reduce((sum, s) => sum + s.mood, 0) / standups.length) * 100) / 100
      : 0;
    const blockerCount = standups.filter((s) => s.blockers.trim() !== '').length;

    return {
      teamId,
      teamName,
      standups,
      avgMood,
      blockerCount,
    };
  }
}
