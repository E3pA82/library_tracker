// src/components/GoalForm.jsx
import React, { useState } from 'react';
import api from '../services/api';

function GoalForm({ onSuccess }) {
  const [goalType, setGoalType] = useState('pages');   // pages | books
  const [period, setPeriod]     = useState('daily');   // daily | weekly | monthly | yearly
  const [target, setTarget]     = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const targetNumber = parseInt(target, 10);
    if (isNaN(targetNumber) || targetNumber <= 0) {
      setError("L'objectif doit être un nombre entier positif.");
      return;
    }

    if (!startDate || !endDate) {
      setError('Les dates de début et de fin sont obligatoires.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/goals/', {
        goal_type: goalType,
        period,
        target: targetNumber,
        start_date: startDate,
        end_date: endDate,
      });

      setSuccess('Objectif créé avec succès.');
      // Réinitialiser le formulaire
      setTarget('');
      setStartDate('');
      setEndDate('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError("Erreur lors de la création de l'objectif.");
      } else {
        setError("Impossible de contacter le serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}
      style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 5,
        boxShadow: '0 0 4px rgba(0,0,0,0.1)',
        maxWidth: 500,
      }}
    >
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {/* Type d'objectif */}
      <div style={{ marginBottom: 10 }}>
        <label><strong>Type d'objectif :</strong></label><br />
        <select
          value={goalType}
          onChange={(e) => setGoalType(e.target.value)}
          style={{ padding: 5, width: '100%', maxWidth: 300 }}
        >
          <option value="pages">Pages</option>
          <option value="books">Livres</option>
        </select>
      </div>

      {/* Période */}
      <div style={{ marginBottom: 10 }}>
        <label><strong>Période :</strong></label><br />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ padding: 5, width: '100%', maxWidth: 300 }}
        >
          <option value="daily">Quotidien</option>
          <option value="weekly">Hebdomadaire</option>
          <option value="monthly">Mensuel</option>
          <option value="yearly">Annuel</option>
        </select>
      </div>

      {/* Cible */}
      <div style={{ marginBottom: 10 }}>
        <label><strong>Objectif :</strong></label><br />
        <input
          type="number"
          min="1"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          style={{ padding: 5, width: '100%', maxWidth: 200 }}
          required
        />
        <span style={{ marginLeft: 8 }}>
          {goalType === 'pages' ? 'pages' : 'livres'}
        </span>
      </div>

      {/* Dates */}
      <div style={{ marginBottom: 10 }}>
        <label><strong>Date de début :</strong></label><br />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: 5, width: '100%', maxWidth: 250 }}
          required
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label><strong>Date de fin :</strong></label><br />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: 5, width: '100%', maxWidth: 250 }}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '8px 12px',
          borderRadius: '3px',
          border: 'none',
          backgroundColor: '#27ae60',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Création...' : 'Créer l’objectif'}
      </button>
    </form>
  );
}

export default GoalForm;