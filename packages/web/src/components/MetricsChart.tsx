import React from 'react';
import { MoodHistory } from '../types';

interface MetricsChartProps {
  history: MoodHistory[];
  teamName: string;
}

export default function MetricsChart({ history, teamName }: MetricsChartProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">{teamName} - Mood Trend</h3>
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  const maxMood = 5;
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const xStep = innerWidth / Math.max(history.length - 1, 1);

  const points = history.map((h, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + innerHeight - (h.avgMood / maxMood) * innerHeight,
    ...h,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">{teamName} - Mood Trend</h3>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Y-axis labels */}
        {[1, 2, 3, 4, 5].map((val) => {
          const y = padding.top + innerHeight - (val / maxMood) * innerHeight;
          return (
            <g key={val}>
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className="text-xs fill-gray-400">
                {val}
              </text>
              <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            </g>
          );
        })}

        {/* Line */}
        <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
        ))}

        {/* X-axis date labels (show a few) */}
        {points
          .filter((_, i) => i % Math.max(1, Math.floor(points.length / 5)) === 0 || i === points.length - 1)
          .map((p, i) => (
            <text key={i} x={p.x} y={chartHeight - 5} textAnchor="middle" className="text-xs fill-gray-400">
              {p.date.slice(5)}
            </text>
          ))}
      </svg>
    </div>
  );
}
