// src/services/api.js
import axios from 'axios';

// Adresse de ton backend Django
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Intercepteur de requête
 * - Ajoute automatiquement le token JWT (si présent dans localStorage)
 */
api.interceptors.request.use(
  (config) => {
    // Récupérer le token d'accès dans localStorage
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      // Ajouter l'en-tête Authorization: Bearer <token>
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    // Erreur avant que la requête ne parte
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse
 * - Si on reçoit un 401, essayer de rafraîchir le token
 * - Si le refresh fonctionne : rejouer la requête
 * - Sinon : nettoyer les tokens et rediriger vers /login
 */
api.interceptors.response.use(
  (response) => {
    // Réponse OK, on la retourne directement
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si on reçoit un 401 et qu'on n'a pas déjà essayé de rafraîchir
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // éviter boucle infinie

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // Pas de refresh token : on ne peut rien faire → déconnexion
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Appel à l'endpoint de refresh Django SimpleJWT
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = refreshResponse.data.access;

        // Sauvegarder le nouveau token
        localStorage.setItem('accessToken', newAccessToken);

        // Mettre à jour l'en-tête Authorization pour la requête originale
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Rejouer la requête originale
        return api(originalRequest);
      } catch (refreshError) {
        // Le refresh a échoué : on nettoie et on redirige
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Pour les autres erreurs, on les propage
    return Promise.reject(error);
  }
);

export default api;