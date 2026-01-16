// src/pages/Library.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';


function Library() {
  const [books, setBooks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, non_lu, en_cours, lu
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Utilitaire pour gérer la pagination DRF (results)
  const extractResults = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  };

   const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/my-books/');
      setBooks(extractResults(res.data));
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement de votre bibliothèque.');
    } finally {
      setLoading(false);
    }
  }, []); // pas de dépendances : la fonction est stable

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleUpdateProgress = async (userBook) => {
    const current = userBook.pages_read || 0;
    const total = userBook.book.total_pages;

    const input = window.prompt(
      `Nombre de pages lues pour "${userBook.book.title}" (0 à ${total}) :`,
      current
    );

    if (input === null) return; // annulé

    const pages = parseInt(input, 10);
    if (isNaN(pages) || pages < 0 || pages > total) {
      window.alert(`Valeur invalide. Entrez un nombre entre 0 et ${total}.`);
      return;
    }

    try {
      await api.post(`/my-books/${userBook.id}/update_progress/`, {
        pages_read: pages,
      });
      await fetchBooks();
    } catch (err) {
      console.error(err);
      window.alert("Erreur lors de la mise à jour des pages lues.");
    }
  };

  const handleDelete = async (userBook) => {
    const confirmDelete = window.confirm(
      `Supprimer "${userBook.book.title}" de votre bibliothèque ?`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/my-books/${userBook.id}/`);
      await fetchBooks();
    } catch (err) {
      console.error(err);
      window.alert("Erreur lors de la suppression du livre.");
    }
  };

  const filteredBooks = books.filter((ub) =>
    filterStatus === 'all' ? true : ub.status === filterStatus
  );

  const statusLabel = (status) => {
    switch (status) {
      case 'non_lu':
        return 'Non lu';
      case 'en_cours':
        return 'En cours';
      case 'lu':
        return 'Lu';
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div>
        <h1>📚 Ma Bibliothèque</h1>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Filtres par statut */}
        <div style={{ marginTop: 10, marginBottom: 20 }}>
          <span>Filtrer par statut : </span>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              marginRight: 5,
              backgroundColor: filterStatus === 'all' ? '#3498db' : '#bdc3c7',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterStatus('non_lu')}
            style={{
              marginRight: 5,
              backgroundColor: filterStatus === 'non_lu' ? '#3498db' : '#bdc3c7',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Non lus
          </button>
          <button
            onClick={() => setFilterStatus('en_cours')}
            style={{
              marginRight: 5,
              backgroundColor: filterStatus === 'en_cours' ? '#3498db' : '#bdc3c7',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            En cours
          </button>
          <button
            onClick={() => setFilterStatus('lu')}
            style={{
              marginRight: 5,
              backgroundColor: filterStatus === 'lu' ? '#3498db' : '#bdc3c7',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Lus
          </button>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : filteredBooks.length === 0 ? (
          <p>Aucun livre dans cette catégorie.</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Titre</th>
                <th style={thStyle}>Auteur</th>
                <th style={thStyle}>Statut</th>
                <th style={thStyle}>Progression</th>
                <th style={thStyle}>Pages lues</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((ub) => (
                <tr key={ub.id}>
                  <td style={tdStyle}>
                    <Link to={`/library/${ub.id}`} style={{ textDecoration: 'none', color: '#2980b9' }}>
                      {ub.book.title}
                    </Link>
                  </td>
                  <td style={tdStyle}>{ub.book.author?.name}</td>
                  <td style={tdStyle}>{statusLabel(ub.status)}</td>
                  <td style={tdStyle}>
                    <ProgressBar value={ub.progress || 0} />
                  </td>
                  <td style={tdStyle}>
                    {ub.pages_read}/{ub.book.total_pages}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleUpdateProgress(ub)}
                      style={{
                        marginRight: 5,
                        padding: '5px 8px',
                        borderRadius: '3px',
                        border: 'none',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      Mettre à jour
                    </button>
                    <button
                      onClick={() => handleDelete(ub)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '3px',
                        border: 'none',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

// Styles pour le tableau
const thStyle = {
  borderBottom: '1px solid #ddd',
  textAlign: 'left',
  padding: '8px',
  backgroundColor: '#ecf0f1',
};

const tdStyle = {
  borderBottom: '1px solid #eee',
  padding: '8px',
};

// Composant barre de progression
function ProgressBar({ value }) {
  const percent = Math.max(0, Math.min(100, value)); // clamp 0-100
  return (
    <div
      style={{
        width: '100%',
        height: '10px',
        backgroundColor: '#ecf0f1',
        borderRadius: '5px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: '100%',
          backgroundColor: '#3498db',
        }}
      />
    </div>
  );
}

export default Library;