import { Standup } from './types.js';

/**
 * Map a raw `standups` table row (snake_case columns) to a typed {@link Standup}.
 * Shared so the API services don't each reimplement the same row-to-domain mapping.
 */
export function rowToStandup(row: Record<string, unknown>): Standup {
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
