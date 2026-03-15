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

export interface MoodHistory {
  date: string;
  avgMood: number;
  count: number;
}
