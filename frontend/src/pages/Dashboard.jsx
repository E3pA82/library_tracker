// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiCheckCircle, FiClock, FiBookOpen, FiFileText, FiTarget, FiArrowRight } from 'react-icons/fi';
import Layout from '../components/Layout';
import api from '../services/api';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [booksInProgress, setBooksInProgress] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
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
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Chargement du tableau de bord..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <PageHeader 
          title="Tableau de bord" 
          subtitle="Bienvenue dans votre espace de lecture"
          icon={FiBook}
        />

        {error && <Alert type="error">{error}</Alert>}

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Total livres" value={stats.total} icon={FiBook} color="from-primary-500 to-primary-600" delay={0} />
            <StatCard label="Lus" value={stats.lu} icon={FiCheckCircle} color="from-emerald-500 to-green-600" delay={0.1} />
            <StatCard label="En cours" value={stats.en_cours} icon={FiClock} color="from-amber-500 to-orange-600" delay={0.2} />
            <StatCard label="Non lus" value={stats.non_lu} icon={FiBookOpen} color="from-gray-500 to-gray-600" delay={0.3} />
            <StatCard label="Pages lues" value={stats.pages_lues} icon={FiFileText} color="from-purple-500 to-pink-600" delay={0.4} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Livres en cours */}
          <Card delay={0.2}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FiBookOpen className="text-primary-400" />
                Livres en cours
              </h2>
              <Link to="/library" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 transition-colors">
                Voir tout <FiArrowRight />
              </Link>
            </div>

            {booksInProgress.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Aucun livre en cours.{' '}
                <Link to="/add-book" className="text-primary-400 hover:underline">
                  Ajouter un livre
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {booksInProgress.slice(0, 5).map((ub, index) => (
                  <motion.div
                    key={ub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link 
                          to={`/library/${ub.id}`} 
                          className="font-medium text-white hover:text-primary-400 transition-colors"
                        >
                          {ub.book.title}
                        </Link>
                        <p className="text-sm text-gray-400">{ub.book.author?.name}</p>
                      </div>
                      <span className="text-sm text-gray-400 bg-white/10 px-2 py-1 rounded-lg">
                        {ub.pages_read}/{ub.book.total_pages}
                      </span>
                    </div>
                    <ProgressBar value={ub.progress || 0} />
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {/* Objectifs */}
          <Card delay={0.3}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FiTarget className="text-emerald-400" />
                Mes objectifs
              </h2>
              <Link to="/goals" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 transition-colors">
                Voir tout <FiArrowRight />
              </Link>
            </div>

            {goals.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Aucun objectif défini.{' '}
                <Link to="/goals/new" className="text-primary-400 hover:underline">
                  Créer un objectif
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal, index) => {
                  const current = goal.current_value ?? 0;
                  const progress = goal.progress_percentage ?? 0;
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">
                          {goal.goal_type === 'pages' ? 'Pages' : 'Livres'} - {goal.period}
                        </span>
                        <span className="text-sm text-gray-400 bg-white/10 px-2 py-1 rounded-lg">
                          {current}/{goal.target}
                        </span>
                      </div>
                      <ProgressBar value={progress} color="success" />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;