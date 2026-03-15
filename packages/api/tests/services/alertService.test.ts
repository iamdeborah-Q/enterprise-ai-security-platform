import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { AlertService } from '../../src/services/alertService.js';
import { createTestDb, seedTestTeam, seedTestStandup } from '../setup.js';

let db: Database.Database;
let service: AlertService;

function recentDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function seedStandups(
  db: Database.Database,
  teamId: string,
  moods: Array<{ daysAgo: number; mood: number }>
) {
  moods.forEach((entry, i) => {
    seedTestStandup(db, {
      id: `standup-${teamId}-${i}`,
      team_id: teamId,
      date: recentDate(entry.daysAgo),
      mood: entry.mood,
    });
  });
}

beforeEach(() => {
  db = createTestDb();
  service = new AlertService(db);
});

describe('AlertService', () => {
  describe('getAllAlerts', () => {
    it('should return empty array when no teams exist', () => {
      expect(service.getAllAlerts()).toEqual([]);
    });

    it('should return empty array when no standups exist', () => {
      seedTestTeam(db);
      expect(service.getAllAlerts()).toEqual([]);
    });

    it('should return no alert when team has fewer than 3 days of data', () => {
      seedTestTeam(db);
      seedStandups(db, 'test-team-1', [
        { daysAgo: 1, mood: 1 },
        { daysAgo: 2, mood: 1 },
      ]);
      expect(service.getAllAlerts()).toEqual([]);
    });

    it('should return no alert when 3 days are above threshold', () => {
      seedTestTeam(db);
      seedStandups(db, 'test-team-1', [
        { daysAgo: 1, mood: 3 },
        { daysAgo: 2, mood: 4 },
        { daysAgo: 3, mood: 3 },
      ]);
      expect(service.getAllAlerts()).toEqual([]);
    });

    it('should return warning alert when 3 consecutive days below 2.5 but above 2.0', () => {
      seedTestTeam(db);
      seedStandups(db, 'test-team-1', [
        { daysAgo: 1, mood: 2 },
        { daysAgo: 2, mood: 2 },
        { daysAgo: 3, mood: 2 },
      ]);
      const alerts = service.getAllAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].teamId).toBe('test-team-1');
      expect(alerts[0].teamName).toBe('Test Team');
      expect(alerts[0].severity).toBe('warning');
      expect(alerts[0].consecutiveDays).toBe(3);
      expect(alerts[0].alertDates).toHaveLength(3);
      expect(alerts[0].currentAvgMood).toBe(2);
    });

    it('should return critical alert when average is below 2.0', () => {
      seedTestTeam(db);
      seedStandups(db, 'test-team-1', [
        { daysAgo: 1, mood: 1 },
        { daysAgo: 2, mood: 2 },
        { daysAgo: 3, mood: 1 },
      ]);
      const alerts = service.getAllAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe('critical');
      expect(alerts[0].currentAvgMood).toBeLessThan(2.0);
    });

    it('should not alert when only 2 of 3 most recent days are below threshold', () => {
      seedTestTeam(db);
      seedStandups(db, 'test-team-1', [
        { daysAgo: 1, mood: 2 },
        { daysAgo: 2, mood: 3 },
        { daysAgo: 3, mood: 2 },
      ]);
      expect(service.getAllAlerts()).toEqual([]);
    });

    it('should handle multiple teams with mixed alert states', () => {
      seedTestTeam(db, { id: 'team-a', name: 'Team A', slug: 'team-a' });
      seedTestTeam(db, { id: 'team-b', name: 'Team B', slug: 'team-b' });

      // Team A: low mood → alert
      seedStandups(db, 'team-a', [
        { daysAgo: 1, mood: 2 },
        { daysAgo: 2, mood: 2 },
        { daysAgo: 3, mood: 2 },
      ]);

      // Team B: high mood → no alert
      seedStandups(db, 'team-b', [
        { daysAgo: 1, mood: 4 },
        { daysAgo: 2, mood: 5 },
        { daysAgo: 3, mood: 4 },
      ]);

      const alerts = service.getAllAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].teamId).toBe('team-a');
    });

    it('should exclude old data beyond 14 days', () => {
      seedTestTeam(db);
      seedStandups(db, 'test-team-1', [
        { daysAgo: 15, mood: 1 },
        { daysAgo: 16, mood: 1 },
        { daysAgo: 17, mood: 1 },
      ]);
      expect(service.getAllAlerts()).toEqual([]);
    });
  });

  describe('getTeamAlert', () => {
    it('should return null for non-existent team', () => {
      expect(service.getTeamAlert('nonexistent')).toBeNull();
    });

    it('should return null when no alert conditions met', () => {
      seedTestTeam(db);
      seedStandups(db, 'test-team-1', [
        { daysAgo: 1, mood: 4 },
        { daysAgo: 2, mood: 5 },
        { daysAgo: 3, mood: 4 },
      ]);
      expect(service.getTeamAlert('test-team-1')).toBeNull();
    });

    it('should return alert when conditions are met', () => {
      seedTestTeam(db);
      seedStandups(db, 'test-team-1', [
        { daysAgo: 1, mood: 2 },
        { daysAgo: 2, mood: 2 },
        { daysAgo: 3, mood: 2 },
      ]);
      const alert = service.getTeamAlert('test-team-1');
      expect(alert).not.toBeNull();
      expect(alert!.teamId).toBe('test-team-1');
      expect(alert!.severity).toBe('warning');
      expect(alert!.alertDates).toHaveLength(3);
    });
  });
});
