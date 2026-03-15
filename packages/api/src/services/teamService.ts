import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Team, CreateTeamInput, UpdateTeamInput } from '../types/index.js';
import { nowISO } from '../utils/dateUtils.js';

function rowToTeam(row: Record<string, unknown>): Team {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    lead: row.lead as string,
    members: row.members as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class TeamService {
  constructor(private db: Database.Database) {}

  findAll(): Team[] {
    const rows = this.db.prepare('SELECT * FROM teams ORDER BY name').all();
    return rows.map((row) => rowToTeam(row as Record<string, unknown>));
  }

  findById(id: string): Team | undefined {
    const row = this.db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
    return row ? rowToTeam(row as Record<string, unknown>) : undefined;
  }

  create(input: CreateTeamInput): Team {
    const id = uuidv4();
    const now = nowISO();
    this.db
      .prepare(
        'INSERT INTO teams (id, name, slug, lead, members, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(id, input.name, input.slug, input.lead, input.members, now, now);
    return this.findById(id)!;
  }

  update(id: string, input: UpdateTeamInput): Team | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updated = {
      name: input.name ?? existing.name,
      slug: input.slug ?? existing.slug,
      lead: input.lead ?? existing.lead,
      members: input.members ?? existing.members,
    };
    const now = nowISO();
    this.db
      .prepare('UPDATE teams SET name = ?, slug = ?, lead = ?, members = ?, updated_at = ? WHERE id = ?')
      .run(updated.name, updated.slug, updated.lead, updated.members, now, id);
    return this.findById(id);
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM teams WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
