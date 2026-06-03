export interface Team {
  id: string;
  name: string;
  slug: string;
  lead: string;
  members: number;
  createdAt: string;
  updatedAt: string;
}

export interface Standup {
  id: string;
  teamId: string;
  author: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  mood: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

export interface TeamMetric {
  teamId: string;
  teamName: string;
  avgMood: number;
  standupRate: number;
  blockerCount: number;
  trend: 'up' | 'down' | 'stable';
}

export type CreateTeamInput = Omit<Team, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTeamInput = Partial<CreateTeamInput>;

export type CreateStandupInput = Omit<Standup, 'id' | 'createdAt'>;
export type UpdateStandupInput = Partial<Omit<Standup, 'id' | 'createdAt'>>;

export interface MoodAlert {
  teamId: string;
  teamName: string;
  currentAvgMood: number;
  consecutiveDays: number;
  alertDates: string[];
  severity: 'warning' | 'critical';
}

export interface TeamDigest {
  teamId: string;
  teamName: string;
  standups: Standup[];
  avgMood: number;
  blockerCount: number;
}

export interface WeeklyDigest {
  generatedAt: string;
  since: string;
  teams: TeamDigest[];
}
