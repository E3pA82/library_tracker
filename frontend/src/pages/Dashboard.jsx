// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [booksInProgress, setBooksInProgress] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Petite fonction utilitaire pour gérer la pagination DRF
  const extractResults = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  };

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError('');

      try {
        // On charge tout en parallèle
        const [statsRes, booksRes, goalsRes] = await Promise.all([
          api.get('/my-books/stats/'),
          api.get('/my-books/', { params: { status: 'en_cours' } }),
          api.get('/goals/'),
        ]);

        setStats(statsRes.data);
        setBooksInProgress(extractResults(booksRes.data));
        setGoals(extractResults(goalsRes.data));
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement du tableau de bord.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <div>
        <h1>📊 Tableau de bord</h1>

        {loading && <p>Chargement des données...</p>}

        {error && (
          <p style={{ color: 'red' }}>
            {error}
          </p>
        )}

        {/* Section Statistiques */}
        {stats && !loading && (
          <div style={{ marginTop: 20 }}>
            <h2>Statistiques de lecture</h2>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginTop: '10px',
              }}
            >
              <StatCard label="Total livres" value={stats.total} />
              <StatCard label="Lus" value={stats.lu} />
              <StatCard label="En cours" value={stats.en_cours} />
              <StatCard label="Non lus" value={stats.non_lu} />
              <StatCard label="Pages lues" value={stats.pages_lues} />
            </div>
          </div>
        )}

        {/* Section Livres en cours */}
        {!loading && (
          <div style={{ marginTop: 30 }}>
            <h2>📚 Livres en cours de lecture</h2>
            {booksInProgress.length === 0 ? (
              <p>Aucun livre en cours pour le moment.</p>
            ) : (
              <ul>
                {booksInProgress.map((ub) => (
                  <li
                    key={ub.id}
                    style={{
                      marginBottom: 10,
                      padding: 10,
                      backgroundColor: 'white',
                      borderRadius: 5,
                      boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <strong>{ub.book.title}</strong>
                    {' — '}
                    {ub.book.author?.name}
                    <br />
                    <span>
                      {ub.pages_read}/{ub.book.total_pages} pages (
                      {ub.progress}%)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Section Objectifs */}
        {!loading && (
          <div style={{ marginTop: 30 }}>
            <h2>🎯 Mes objectifs</h2>
            {goals.length === 0 ? (
              <p>Aucun objectif défini.</p>
            ) : (
              <ul>
                {goals.map((goal) => (
                  <li
                    key={goal.id}
                    style={{
                      marginBottom: 10,
                      padding: 10,
                      backgroundColor: 'white',
                      borderRadius: 5,
                      boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <strong>
                      {goal.goal_type === 'pages' ? 'Pages' : 'Livres'} —{' '}
                      {goal.period}
                    </strong>
                    <br />
                    Objectif : {goal.target}{' '}
                    {goal.goal_type === 'pages' ? 'pages' : 'livres'}
                    <br />
                    Du {goal.start_date} au {goal.end_date}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

// Petit composant pour les cartes de stats
function StatCard({ label, value }) {
  return (
    <div
      style={{
        minWidth: '140px',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '5px',
        boxShadow: '0 0 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontSize: '14px', color: '#555' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{value}</div>
    </div>
  );
}

export default Dashboard;