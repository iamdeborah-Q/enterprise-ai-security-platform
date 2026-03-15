import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { TeamService } from '../../src/services/teamService.js';
import { createTestDb, seedTestTeam } from '../setup.js';

let db: Database.Database;
let service: TeamService;

beforeEach(() => {
  db = createTestDb();
  service = new TeamService(db);
});

describe('TeamService', () => {
  describe('findAll', () => {
    it('should return empty array when no teams', () => {
      expect(service.findAll()).toEqual([]);
    });

    it('should return all teams', () => {
      seedTestTeam(db);
      seedTestTeam(db, { id: 'test-team-2', name: 'Team 2', slug: 'team-2' });
      const teams = service.findAll();
      expect(teams).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return undefined for non-existent team', () => {
      expect(service.findById('nonexistent')).toBeUndefined();
    });

    it('should return team by id', () => {
      seedTestTeam(db);
      const team = service.findById('test-team-1');
      expect(team).toBeDefined();
      expect(team!.name).toBe('Test Team');
    });
  });

  describe('create', () => {
    it('should create and return a team', () => {
      const team = service.create({
        name: 'New Team',
        slug: 'new-team',
        lead: 'Leader',
        members: 3,
      });

      expect(team.name).toBe('New Team');
      expect(team.id).toBeDefined();
      expect(service.findAll()).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update a team', () => {
      seedTestTeam(db);
      const updated = service.update('test-team-1', { name: 'Updated Name' });
      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated Name');
    });

    it('should return undefined for non-existent team', () => {
      expect(service.update('nonexistent', { name: 'test' })).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a team', () => {
      seedTestTeam(db);
      expect(service.delete('test-team-1')).toBe(true);
      expect(service.findAll()).toHaveLength(0);
    });

    it('should return false for non-existent team', () => {
      expect(service.delete('nonexistent')).toBe(false);
    });
  });
});
