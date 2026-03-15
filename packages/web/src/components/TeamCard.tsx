import React from 'react';
import { TeamMetric } from '../types';

const MOOD_COLORS: Record<string, string> = {
  1: 'bg-red-100 text-red-800',
  2: 'bg-orange-100 text-orange-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-green-100 text-green-800',
  5: 'bg-emerald-100 text-emerald-800',
};

const TREND_ICONS: Record<string, string> = {
  up: '\u2191',
  down: '\u2193',
  stable: '\u2192',
};

interface TeamCardProps {
  metric: TeamMetric;
}

export default function TeamCard({ metric }: TeamCardProps) {
  const moodKey = String(Math.round(metric.avgMood) || 3);
  const moodClass = MOOD_COLORS[moodKey] || MOOD_COLORS['3'];

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{metric.teamName}</h3>
        <span className="text-lg">{TREND_ICONS[metric.trend]}</span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Avg Mood</span>
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${moodClass}`}>
            {metric.avgMood.toFixed(1)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Standup Rate</span>
          <span className="text-sm font-medium text-gray-700">{metric.standupRate}%</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Blockers</span>
          <span className={`text-sm font-medium ${metric.blockerCount > 0 ? 'text-red-600' : 'text-gray-700'}`}>
            {metric.blockerCount}
          </span>
        </div>
      </div>
    </div>
  );
}
