// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    api.get('/my-books/stats/').then(res => setStats(res.data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Tableau de bord</h1>
      <button onClick={logout}>Déconnexion</button>
      
      {stats && (
        <div>
          <p>Total livres: {stats.total}</p>
          <p>Lus: {stats.lu}</p>
          <p>En cours: {stats.en_cours}</p>
          <p>Non lus: {stats.non_lu}</p>
          <p>Pages lues: {stats.pages_lues}</p>
        </div>
      )}
      
      <Link to="/library">Ma Bibliothèque</Link>
    </div>
  );
}