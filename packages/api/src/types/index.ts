import { Request } from 'express';

export type {
  Team,
  Standup,
  TeamMetric,
  MoodAlert,
  CreateTeamInput,
  UpdateTeamInput,
  CreateStandupInput,
  UpdateStandupInput,
  TeamDigest,
  WeeklyDigest,
} from '@teampulse/shared';

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface StandupFilterQuery extends PaginationQuery {
  teamId?: string;
  date?: string;
}
