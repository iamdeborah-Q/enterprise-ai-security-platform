export const APP_VERSION = '1.0.0';

export const MOOD_LABELS: Record<number, string> = {
  1: 'Terrible',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export const MOOD_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#22c55e',
  5: '#10b981',
};

export const DEFAULT_PORT = 3001;
export const API_PREFIX = '/api';

export const MOOD_ALERT_THRESHOLD = 2.5;
export const MOOD_ALERT_CRITICAL_THRESHOLD = 2.0;
export const MOOD_ALERT_CONSECUTIVE_DAYS = 3;
