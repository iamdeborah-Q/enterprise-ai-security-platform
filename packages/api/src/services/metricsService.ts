import Database from 'better-sqlite3';
import { TeamMetric } from '../types/index.js';
import { daysAgo, formatDate } from '../utils/dateUtils.js';

export class MetricsService {
  constructor(private db: Database.Database) {}

  getAllMetrics(): TeamMetric[] {
    const teams = this.db.prepare('SELECT id, name FROM teams ORDER BY name').all() as Array<{
      id: string;
      name: string;
    }>;

    return teams.map((team) => this.getTeamMetric(team.id, team.name));
  }

  getTeamMetrics(teamId: string): TeamMetric | undefined {
    const team = this.db.prepare('SELECT id, name FROM teams WHERE id = ?').get(teamId) as
      | { id: string; name: string }
      | undefined;

    if (!team) return undefined;
    return this.getTeamMetric(team.id, team.name);
  }

  getTeamHistory(teamId: string): Array<{ date: string; avgMood: number; count: number }> {
    const since = daysAgo(30);
    const rows = this.db
      .prepare(
        `SELECT date, AVG(mood) as avg_mood, COUNT(*) as count
         FROM standups
         WHERE team_id = ? AND date >= ?
         GROUP BY date
         ORDER BY date ASC`
      )
      .all(teamId, since) as Array<{ date: string; avg_mood: number; count: number }>;

    return rows.map((row) => ({
      date: row.date,
      avgMood: Math.round(row.avg_mood * 100) / 100,
      count: row.count,
    }));
  }

  private getTeamMetric(teamId: string, teamName: string): TeamMetric {
    const since = formatDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));

    const moodRow = this.db
      .prepare('SELECT AVG(mood) as avg_mood FROM standups WHERE team_id = ? AND date >= ?')
      .get(teamId, since) as { avg_mood: number | null };

    const standupCount = this.db
      .prepare('SELECT COUNT(DISTINCT date) as count FROM standups WHERE team_id = ? AND date >= ?')
      .get(teamId, since) as { count: number };

    const blockerCount = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM standups WHERE team_id = ? AND date >= ? AND blockers != ''"
      )
      .get(teamId, since) as { count: number };

    // Calculate trend by comparing last 7 days vs previous 7 days
    const sevenDaysAgo = daysAgo(7);
    const recentMood = this.db
      .prepare('SELECT AVG(mood) as avg FROM standups WHERE team_id = ? AND date >= ?')
      .get(teamId, sevenDaysAgo) as { avg: number | null };

    const olderMood = this.db
      .prepare('SELECT AVG(mood) as avg FROM standups WHERE team_id = ? AND date >= ? AND date < ?')
      .get(teamId, since, sevenDaysAgo) as { avg: number | null };

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentMood.avg !== null && olderMood.avg !== null) {
      const diff = recentMood.avg - olderMood.avg;
      if (diff > 0.3) trend = 'up';
      else if (diff < -0.3) trend = 'down';
    }

    // 10 weekdays in 2 weeks
    const standupRate = Math.min(100, Math.round((standupCount.count / 10) * 100));

    return {
      teamId,
      teamName,
      avgMood: moodRow.avg_mood ? Math.round(moodRow.avg_mood * 100) / 100 : 0,
      standupRate,
      blockerCount: blockerCount.count,
      trend,
    };
  }
}
