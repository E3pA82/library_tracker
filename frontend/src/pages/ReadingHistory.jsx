// src/pages/ReadingHistory.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { FiTrendingUp, FiBookOpen } from 'react-icons/fi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Layout from '../components/Layout';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import api from '../services/api';

const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

function ReadingHistory() {
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sessionsRes, summaryRes] = await Promise.all([
        api.get('/reading-sessions/', { params: { ordering: '-date' } }),
        api.get('/reading-sessions/summary/', { params: { days } }),
      ]);

      setSessions(extractResults(sessionsRes.data));
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement de l'historique de lecture.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Construire une courbe cumulée pour le graphique
  const cumulativeData = summary.reduce((acc, item) => {
    const previousTotal = acc.length > 0 ? acc[acc.length - 1].totalPages : 0;
    acc.push({
      date: item.date,
      pages: item.pages,
      totalPages: previousTotal + item.pages,
    });
    return acc;
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Historique de lecture"
          subtitle="Visualisez vos sessions et votre progression dans le temps"
          icon={FiTrendingUp}
        />

        {error && <Alert type="error">{error}</Alert>}

        {/* Sélecteur de période */}
        <Card variant="glass" className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Période</h2>
            <p className="text-gray-400 text-sm">
              Afficher les pages lues sur les derniers jours.
            </p>
          </div>
          <div className="flex gap-2">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  days === d
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {d} jours
              </button>
            ))}
          </div>
        </Card>

        {loading ? (
          <LoadingSpinner text="Chargement de vos sessions de lecture..." />
        ) : (
          <>
            {/* Graphique */}
            <Card variant="glass">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-primary-400" />
                Pages lues cumulées ({days} derniers jours)
              </h2>
              {cumulativeData.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Pas encore de sessions enregistrées sur cette période.
                </p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cumulativeData}>
                      <defs>
                        <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15,23,42,0.9)',
                          border: '1px solid rgba(148,163,184,0.3)',
                          borderRadius: '0.75rem',
                          color: '#e5e7eb',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="totalPages"
                        stroke="#6366f1"
                        fillOpacity={1}
                        fill="url(#colorPages)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Liste des sessions détaillées */}
            <Card variant="glass">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiBookOpen className="text-emerald-400" />
                Historique détaillé des sessions
              </h2>
              {sessions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Aucune session de lecture enregistrée.
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-start p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <p className="text-sm text-gray-400">
                          {s.date}
                        </p>
                        <p className="font-medium text-white">
                          {s.book_title}
                        </p>
                        {s.notes && (
                          <p className="text-sm text-gray-400 mt-1">
                            {s.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-300">
                        <p className="font-semibold text-primary-300">
                          +{s.pages_read} pages
                        </p>
                        {s.duration_minutes && (
                          <p>{s.duration_minutes} min</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}

export default ReadingHistory;