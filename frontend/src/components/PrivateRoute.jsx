// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Pendant qu'on vérifie l'état d'auth (au cas où plus tard on charge un profil)
  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Chargement...
      </div>
    );
  }

  // Si pas connecté → rediriger vers /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Sinon, afficher la page protégée
  return children;
}

export default PrivateRoute;