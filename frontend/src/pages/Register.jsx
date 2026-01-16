// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si déjà connecté, on ne laisse pas aller sur /register
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Appel à l’API /api/register/
      await api.post('/register/', {
        username,
        email,
        password,
      });

      // Si tout va bien, on redirige vers la page de login
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
      // Gestion des erreurs
      if (err.response && err.response.data) {
        const data = err.response.data;

        // Si l’API renvoie des erreurs de validation de champs
        if (data.username) {
          setError(`Username : ${data.username.join(' ')}`);
        } else if (data.email) {
          setError(`Email : ${data.email.join(' ')}`);
        } else if (data.password) {
          setError(`Mot de passe : ${data.password.join(' ')}`);
        } else {
          setError("Erreur lors de l'inscription.");
        }
      } else {
        setError("Impossible de contacter le serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: '0 auto' }}>
      <h1>Inscription</h1>

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
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Email :</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Mot de passe :</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}

export default Register;