// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Accueil - Library Tracker</h1>
      <p>Bienvenue dans ton gestionnaire de bibliothèque.</p>
      <p>
        <Link to="/login">Aller à la page de connexion</Link>
      </p>
      <p>
        <Link to="/dashboard">Aller au tableau de bord (futur)</Link>
      </p>
    </div>
  );
}

export default Home;