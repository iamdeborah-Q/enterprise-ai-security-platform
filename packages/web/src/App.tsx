import React, { useState } from 'react';
import { useApi, apiFetch } from './hooks/useApi';
import { Team, Standup, TeamMetric, MoodHistory } from './types';
import TeamCard from './components/TeamCard';
import StandupEntry from './components/StandupEntry';
import MetricsChart from './components/MetricsChart';

export default function App() {
  const { data: teams } = useApi<Team[]>('/api/teams');
  const { data: standups, refetch: refetchStandups } = useApi<Standup[]>('/api/standups');
  const { data: metrics, refetch: refetchMetrics } = useApi<TeamMetric[]>('/api/metrics');

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const { data: history } = useApi<MoodHistory[]>(
    selectedTeam ? `/api/metrics/${selectedTeam}/history` : ''
  );

  const [formData, setFormData] = useState({
    teamId: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    yesterday: '',
    today: '',
    blockers: '',
    mood: 4,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await apiFetch('/api/standups', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setFormData((prev) => ({ ...prev, yesterday: '', today: '', blockers: '', mood: 4 }));
      refetchStandups();
      refetchMetrics();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit');
    }
  };

  const selectedTeamName = metrics?.find((m) => m.teamId === selectedTeam)?.teamName || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">TeamPulse</h1>
          <p className="text-sm text-gray-500">Team Health & Standup Tracker</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Team Metrics */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Team Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics?.map((metric) => (
              <div key={metric.teamId} onClick={() => setSelectedTeam(metric.teamId)} className="cursor-pointer">
                <TeamCard metric={metric} />
              </div>
            ))}
          </div>
        </section>

        {/* Mood Chart */}
        {selectedTeam && history && (
          <section>
            <MetricsChart history={history} teamName={selectedTeamName} />
          </section>
        )}

        {/* Submit Standup */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Submit Standup</h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 border border-gray-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, teamId: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select team...</option>
                  {teams?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yesterday</label>
              <textarea
                value={formData.yesterday}
                onChange={(e) => setFormData((prev) => ({ ...prev, yesterday: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows={2}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Today</label>
              <textarea
                value={formData.today}
                onChange={(e) => setFormData((prev) => ({ ...prev, today: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows={2}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blockers</label>
              <textarea
                value={formData.blockers}
                onChange={(e) => setFormData((prev) => ({ ...prev, blockers: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows={2}
                placeholder="Leave empty if none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mood (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, mood: m }))}
                    className={`w-10 h-10 rounded-full text-lg ${
                      formData.mood === m ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">
              Submit Standup
            </button>
          </form>
        </section>

        {/* Recent Standups */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Standups</h2>
          <div className="space-y-3">
            {standups?.slice(0, 10).map((standup) => (
              <StandupEntry key={standup.id} standup={standup} />
            ))}
            {standups?.length === 0 && <p className="text-gray-500 text-sm">No standups yet.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
