import React from 'react';
import { Standup } from '../types';

const MOOD_EMOJI: Record<number, string> = {
  1: '\ud83d\ude1e',
  2: '\ud83d\ude15',
  3: '\ud83d\ude10',
  4: '\ud83d\ude42',
  5: '\ud83d\ude04',
};

interface StandupEntryProps {
  standup: Standup;
}

export default function StandupEntry({ standup }: StandupEntryProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{standup.author}</span>
          <span className="text-xl">{MOOD_EMOJI[standup.mood]}</span>
        </div>
        <span className="text-sm text-gray-500">{standup.date}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-600">Yesterday: </span>
          <span className="text-gray-800">{standup.yesterday}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Today: </span>
          <span className="text-gray-800">{standup.today}</span>
        </div>
        {standup.blockers && (
          <div className="bg-red-50 p-2 rounded">
            <span className="font-medium text-red-600">Blocker: </span>
            <span className="text-red-800">{standup.blockers}</span>
          </div>
        )}
      </div>
    </div>
  );
}
