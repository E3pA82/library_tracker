// src/pages/NewGoal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import GoalForm from '../components/GoalForm';

function NewGoal() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Après création, retourner à la liste des objectifs
    navigate('/goals');
  };

  return (
    <Layout>
      <div>
        <h1>Créer un objectif de lecture</h1>
        <p>Définissez un objectif sur une période donnée.</p>

        <div style={{ marginTop: 20 }}>
          <GoalForm onSuccess={handleSuccess} />
        </div>
      </div>
    </Layout>
  );
}

export default NewGoal;