// src/pages/ReadingLists.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

// Utilitaire pour gérer la pagination DRF
const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

function ReadingLists() {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/lists/');
      setLists(extractResults(res.data));
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des listes de lecture.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleDelete = async (listId) => {
    const confirmDelete = window.confirm('Supprimer cette liste de lecture ?');
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      await api.delete(`/lists/${listId}/`);
      await fetchLists();
    } catch (err) {
      console.error(err);
      window.alert('Erreur lors de la suppression de la liste.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = () => {
    // On créera la page /lists/new à la prochaine étape (formulaire)
    navigate('/lists/new');
  };

  return (
    <Layout>
      <div>
        <h1>📋 Mes listes de lecture</h1>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginTop: 10, marginBottom: 20 }}>
          <button
            onClick={handleCreate}
            style={{
              padding: '8px 12px',
              borderRadius: '3px',
              border: 'none',
              backgroundColor: '#2980b9',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            + Créer une nouvelle liste
          </button>
        </div>

        {loading ? (
          <p>Chargement des listes...</p>
        ) : lists.length === 0 ? (
          <p>Aucune liste de lecture pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lists.map((list) => {
              const books = list.books || [];
              const booksCount = books.length;
              const preview = books.slice(0, 3);

              return (
                <div
                  key={list.id}
                  style={{
                    backgroundColor: 'white',
                    padding: 15,
                    borderRadius: 5,
                    boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      <Link to={`/lists/${list.id}`} style={{ textDecoration: 'none', color: '#2980b9' }}>
                        {list.name}
                      </Link>
                    </div>
                    <div style={{ fontSize: '14px', color: '#555' }}>
                      {booksCount} livre{booksCount > 1 ? 's' : ''}
                    </div>

                    {/* Aperçu des livres */}
                    {booksCount > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                          Aperçu :
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {preview.map((ub) => (
                            <li key={ub.id} style={{ fontSize: '14px' }}>
                              {ub.book?.title} — {ub.book?.author?.name}
                            </li>
                          ))}
                        </ul>
                        {booksCount > preview.length && (
                          <div style={{ fontSize: '12px', color: '#777' }}>
                            + {booksCount - preview.length} autre(s)...
                          </div>
                        )}
                      </div>
                    )}

                    {booksCount === 0 && (
                      <div style={{ marginTop: 8, fontSize: '14px', color: '#777' }}>
                        Aucun livre dans cette liste pour l’instant.
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={() => handleDelete(list.id)}
                      disabled={actionLoading}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '3px',
                        border: 'none',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ReadingLists;