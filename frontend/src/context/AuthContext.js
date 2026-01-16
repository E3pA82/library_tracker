// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

// Créer le contexte
const AuthContext = createContext(null);

// Provider qui va entourer toute l'application
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // null = pas connecté
  const [loading, setLoading] = useState(false);

  // Au chargement de l'appli, vérifier si un token existe déjà
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // On considère que l'utilisateur est connecté
      // (on pourra plus tard aller chercher son profil si on a un endpoint)
      setUser({}); // un simple objet vide suffit pour dire "connecté"
    }
  }, []);

  // Fonction de login : appelle l'API /api/login/
  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await api.post('/login/', {
        username,
        password,
      });

      // Stocker les tokens dans localStorage
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);

      // Mettre à jour l'état "user" (on stocke au moins le username)
      setUser({ username });

      // Pas de return spécifique, mais tu peux en ajouter si besoin
    } catch (error) {
      // En cas d'erreur, on s'assure que l'état reste non connecté
      setUser(null);
      throw error; // on relance l'erreur pour que le composant Login puisse l'afficher
    } finally {
      setLoading(false);
    }
  };

  // Fonction de logout
  const logout = () => {
    // Supprimer les tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Réinitialiser l'état
    setUser(null);
  };

  // Valeurs fournies à toute l'appli
  const value = {
    user,                           // objet ou null
    isAuthenticated: !!user,        // booléen pratique
    loading,                        // pour désactiver le bouton pendant le login
    login,                          // fonction à appeler pour se connecter
    logout,                         // fonction à appeler pour se déconnecter
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook pratique pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}