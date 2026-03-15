import { CreateTeamInput, CreateStandupInput } from '../types/index.js';

export function validateTeamInput(
  data: Partial<CreateTeamInput>
): { valid: true; data: CreateTeamInput } | { valid: false; error: string } {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    return { valid: false, error: 'name is required and must be a non-empty string' };
  }
  if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
    return { valid: false, error: 'slug is required and must be a non-empty string' };
  }
  if (!/^[a-z0-9-]+$/.test(data.slug)) {
    return { valid: false, error: 'slug must contain only lowercase letters, numbers, and hyphens' };
  }
  if (!data.lead || typeof data.lead !== 'string' || data.lead.trim().length === 0) {
    return { valid: false, error: 'lead is required and must be a non-empty string' };
  }
  if (data.members === undefined || typeof data.members !== 'number' || data.members < 1) {
    return { valid: false, error: 'members is required and must be a positive number' };
  }

  return {
    valid: true,
    data: {
      name: data.name.trim(),
      slug: data.slug.trim(),
      lead: data.lead.trim(),
      members: data.members,
    },
  };
}

export function validateStandupInput(
  data: Partial<CreateStandupInput>
): { valid: true; data: CreateStandupInput } | { valid: false; error: string } {
  if (!data.teamId || typeof data.teamId !== 'string') {
    return { valid: false, error: 'teamId is required' };
  }
  if (!data.author || typeof data.author !== 'string' || data.author.trim().length === 0) {
    return { valid: false, error: 'author is required and must be a non-empty string' };
  }
  if (!data.date || typeof data.date !== 'string') {
    return { valid: false, error: 'date is required (YYYY-MM-DD format)' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    return { valid: false, error: 'date must be in YYYY-MM-DD format' };
  }
  if (!data.yesterday || typeof data.yesterday !== 'string') {
    return { valid: false, error: 'yesterday is required' };
  }
  if (!data.today || typeof data.today !== 'string') {
    return { valid: false, error: 'today is required' };
  }
  if (data.blockers === undefined || typeof data.blockers !== 'string') {
    return { valid: false, error: 'blockers is required (use empty string for none)' };
  }
  if (!data.mood || ![1, 2, 3, 4, 5].includes(data.mood)) {
    return { valid: false, error: 'mood is required and must be 1-5' };
  }

  return {
    valid: true,
    data: {
      teamId: data.teamId,
      author: data.author.trim(),
      date: data.date,
      yesterday: data.yesterday.trim(),
      today: data.today.trim(),
      blockers: data.blockers.trim(),
      mood: data.mood as 1 | 2 | 3 | 4 | 5,
    },
  };
}
