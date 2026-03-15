import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { MetricsService } from '../../src/services/metricsService.js';
import { createTestDb, seedTestTeam, seedTestStandup } from '../setup.js';

let db: Database.Database;
let service: MetricsService;

beforeEach(() => {
  db = createTestDb();
  service = new MetricsService(db);
});

describe('MetricsService', () => {
  describe('getAllMetrics', () => {
    it('should return metrics for all teams', () => {
      seedTestTeam(db);
      seedTestTeam(db, { id: 'test-team-2', name: 'Team 2', slug: 'team-2' });
      const metrics = service.getAllMetrics();
      expect(metrics).toHaveLength(2);
    });

    it('should return empty array when no teams', () => {
      expect(service.getAllMetrics()).toEqual([]);
    });
  });

  describe('getTeamMetrics', () => {
    it('should return undefined for non-existent team', () => {
      expect(service.getTeamMetrics('nonexistent')).toBeUndefined();
    });

    it('should return metrics for a team', () => {
      seedTestTeam(db);
      seedTestStandup(db);
      const metrics = service.getTeamMetrics('test-team-1');
      expect(metrics).toBeDefined();
      expect(metrics!.teamId).toBe('test-team-1');
      expect(metrics!.teamName).toBe('Test Team');
    });

    it('should calculate correct average mood', () => {
      seedTestTeam(db);
      // Seed three standups with moods that cause floating point issues
      const today = new Date().toISOString().split('T')[0];
      seedTestStandup(db, { id: 'standup-1', mood: 1, date: today });
      seedTestStandup(db, { id: 'standup-2', mood: 2, date: today });
      seedTestStandup(db, { id: 'standup-3', mood: 4, date: today });

      const metrics = service.getTeamMetrics('test-team-1');
      // (1 + 2 + 4) / 3 = 2.3333... service rounds to 2 decimal places
      expect(metrics!.avgMood).toBe(2.33);
    });
  });

  describe('getTeamHistory', () => {
    it('should return empty array for team with no standups', () => {
      seedTestTeam(db);
      const history = service.getTeamHistory('test-team-1');
      expect(history).toEqual([]);
    });
  });
});
