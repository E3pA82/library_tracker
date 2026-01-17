// src/pages/Goals.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

// Utilitaire pour gérer la pagination DRF
const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/goals/');
      setGoals(extractResults(res.data));
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des objectifs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDelete = async (goalId) => {
    const confirmDelete = window.confirm('Supprimer cet objectif ?');
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      await api.delete(`/goals/${goalId}/`);
      await fetchGoals();
    } catch (err) {
      console.error(err);
      window.alert("Erreur lors de la suppression de l'objectif.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = () => {
    // On préparera la route /goals/new en phase 9.2
    navigate('/goals/new');
  };

  const goalTypeLabel = (type) => {
    switch (type) {
      case 'pages':
        return 'Pages';
      case 'books':
        return 'Livres';
      default:
        return type;
    }
  };

  const periodLabel = (period) => {
    switch (period) {
      case 'daily':
        return 'Jour';
      case 'weekly':
        return 'Semaine';
      case 'monthly':
        return 'Mois';
      case 'yearly':
        return 'Année';
      default:
        return period;
    }
  };

  return (
    <Layout>
      <div>
        <h1>🎯 Mes objectifs</h1>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginTop: 10, marginBottom: 20 }}>
          <button
            onClick={handleCreate}
            style={{
              padding: '8px 12px',
              borderRadius: '3px',
              border: 'none',
              backgroundColor: '#2980b9',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            + Créer un nouvel objectif
          </button>
        </div>

        {loading ? (
          <p>Chargement des objectifs...</p>
        ) : goals.length === 0 ? (
          <p>Aucun objectif pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {goals.map((goal) => {
              // Pour l'instant, on met Actuel à 0 et progression à 0%
              // On implémentera un vrai calcul en phase 9.3
              const current = goal.current_value ?? 0;
              const target = goal.target;
              const progress =
                goal.progress_percentage ??
                (target > 0 ? Math.min(100, (current / target) * 100) : 0);
              return (
                <div
                  key={goal.id}
                  style={{
                    backgroundColor: 'white',
                    padding: 15,
                    borderRadius: 5,
                    boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      {goalTypeLabel(goal.goal_type)} — {periodLabel(goal.period)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#555' }}>
                      Du {goal.start_date} au {goal.end_date}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: '14px' }}>
                        Objectif : {target}{' '}
                        {goal.goal_type === 'pages' ? 'pages' : 'livres'}
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        Actuel : {current}{' '}
                        {goal.goal_type === 'pages' ? 'pages' : 'livres'}
                      </div>
                      <div style={{ marginTop: 5 }}>
                        <ProgressBar value={progress} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      disabled={actionLoading}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '3px',
                        border: 'none',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

function ProgressBar({ value }) {
  const percent = Math.max(0, Math.min(100, value));
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 300,
        height: '12px',
        backgroundColor: '#ecf0f1',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: '100%',
          backgroundColor: '#27ae60',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}

export default Goals;