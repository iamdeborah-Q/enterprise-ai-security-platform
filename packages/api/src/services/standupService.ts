import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { rowToStandup } from '@teampulse/shared';
import { Standup, CreateStandupInput, UpdateStandupInput } from '../types/index.js';
import { nowISO } from '../utils/dateUtils.js';

export class StandupService {
  constructor(private db: Database.Database) {}

  findAll(filters?: { teamId?: string; date?: string }): Standup[] {
    let query = 'SELECT * FROM standups';
    const params: string[] = [];
    const conditions: string[] = [];

    if (filters?.teamId) {
      conditions.push('team_id = ?');
      params.push(filters.teamId);
    }
    if (filters?.date) {
      conditions.push('date = ?');
      params.push(filters.date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY date DESC, created_at DESC';

    const rows = this.db.prepare(query).all(...params);
    return rows.map((row) => rowToStandup(row as Record<string, unknown>));
  }

  findById(id: string): Standup | undefined {
    const row = this.db.prepare('SELECT * FROM standups WHERE id = ?').get(id);
    return row ? rowToStandup(row as Record<string, unknown>) : undefined;
  }

  create(input: CreateStandupInput): Standup {
    const id = uuidv4();
    const now = nowISO();
    this.db
      .prepare(
        'INSERT INTO standups (id, team_id, author, date, yesterday, today, blockers, mood, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(id, input.teamId, input.author, input.date, input.yesterday, input.today, input.blockers, input.mood, now);
    return this.findById(id)!;
  }

  update(id: string, input: UpdateStandupInput): Standup | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updated = {
      teamId: input.teamId ?? existing.teamId,
      author: input.author ?? existing.author,
      date: input.date ?? existing.date,
      yesterday: input.yesterday ?? existing.yesterday,
      today: input.today ?? existing.today,
      blockers: input.blockers ?? existing.blockers,
      mood: input.mood ?? existing.mood,
    };

    this.db
      .prepare(
        'UPDATE standups SET team_id = ?, author = ?, date = ?, yesterday = ?, today = ?, blockers = ?, mood = ? WHERE id = ?'
      )
      .run(updated.teamId, updated.author, updated.date, updated.yesterday, updated.today, updated.blockers, updated.mood, id);
    return this.findById(id);
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM standups WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
