import Database from 'better-sqlite3';
import { MoodAlert } from '../types/index.js';
import { daysAgo } from '../utils/dateUtils.js';
import {
  MOOD_ALERT_THRESHOLD,
  MOOD_ALERT_CRITICAL_THRESHOLD,
  MOOD_ALERT_CONSECUTIVE_DAYS,
} from '@teampulse/shared';

interface DailyMoodRow {
  date: string;
  avg_mood: number;
}

export class AlertService {
  constructor(private db: Database.Database) {}

  getAllAlerts(): MoodAlert[] {
    const teams = this.db
      .prepare('SELECT id, name FROM teams ORDER BY name')
      .all() as Array<{ id: string; name: string }>;

    const alerts: MoodAlert[] = [];
    for (const team of teams) {
      const alert = this.computeAlert(team.id, team.name);
      if (alert) {
        alerts.push(alert);
      }
    }
    return alerts;
  }

  getTeamAlert(teamId: string): MoodAlert | null {
    const team = this.db
      .prepare('SELECT id, name FROM teams WHERE id = ?')
      .get(teamId) as { id: string; name: string } | undefined;

    if (!team) return null;
    return this.computeAlert(team.id, team.name);
  }

  private computeAlert(teamId: string, teamName: string): MoodAlert | null {
    const since = daysAgo(14);

    const rows = this.db
      .prepare(
        `SELECT date, AVG(mood) as avg_mood
         FROM standups
         WHERE team_id = ? AND date >= ?
         GROUP BY date
         ORDER BY date DESC
         LIMIT ?`
      )
      .all(teamId, since, MOOD_ALERT_CONSECUTIVE_DAYS) as DailyMoodRow[];

    if (rows.length < MOOD_ALERT_CONSECUTIVE_DAYS) {
      return null;
    }

    const allBelowThreshold = rows.every(
      (row) => row.avg_mood < MOOD_ALERT_THRESHOLD
    );

    if (!allBelowThreshold) {
      return null;
    }

    const overallAvg =
      rows.reduce((sum, row) => sum + row.avg_mood, 0) / rows.length;
    const roundedAvg = Math.round(overallAvg * 100) / 100;

    const severity: 'warning' | 'critical' =
      roundedAvg < MOOD_ALERT_CRITICAL_THRESHOLD ? 'critical' : 'warning';

    return {
      teamId,
      teamName,
      currentAvgMood: roundedAvg,
      consecutiveDays: rows.length,
      alertDates: rows.map((row) => row.date).sort(),
      severity,
    };
  }
}
