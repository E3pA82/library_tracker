// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Si l'utilisateur est déjà connecté, on le redirige vers le dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);     // Appel à AuthContext → /api/login/
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Gestion des erreurs
      if (err.response) {
        if (err.response.status === 401) {
          setError("Nom d'utilisateur ou mot de passe incorrect.");
        } else {
          setError(`Erreur serveur (${err.response.status}).`);
        }
      } else {
        setError("Impossible de se connecter au serveur.");
      }
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: '0 auto' }}>
      <h1>Connexion</h1>

      {error && (
        <div style={{ color: 'red', marginBottom: 10 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Nom d'utilisateur :</label><br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Mot de passe :</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <p style={{ marginTop: 10 }}>
      Pas encore de compte ? <Link to="/register">Créer un compte</Link>
</p>
    </div>
  );
}

export default Login;