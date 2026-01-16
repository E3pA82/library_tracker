// src/pages/BookDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

function BookDetail() {
  const { id } = useParams(); // ID du UserBook
  const navigate = useNavigate();

  const [userBook, setUserBook] = useState(null);
  const [pagesRead, setPagesRead] = useState('');
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBookDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/my-books/${id}/`);
      setUserBook(res.data);
      setPagesRead(res.data.pages_read || 0);
      setComment(res.data.comment || '');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setError("Livre non trouvé dans votre bibliothèque.");
      } else {
        setError("Erreur lors du chargement du livre.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookDetail();
  }, [fetchBookDetail]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const pages = parseInt(pagesRead, 10);
    if (isNaN(pages) || pages < 0) {
      setError('Le nombre de pages doit être un entier positif ou zéro.');
      return;
    }

    if (pages > userBook.book.total_pages) {
      setError(`Le nombre de pages ne peut pas dépasser ${userBook.book.total_pages}.`);
      return;
    }

    setSaving(true);

    try {
      // Mettre à jour les pages lues
      await api.post(`/my-books/${id}/update_progress/`, {
        pages_read: pages,
      });

      // Mettre à jour le commentaire (PATCH sur /my-books/{id}/)
      await api.patch(`/my-books/${id}/`, {
        comment: comment.trim(),
      });

      setSuccessMsg('Livre mis à jour avec succès.');
      // Recharger les données pour voir le nouveau statut
      await fetchBookDetail();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour du livre.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Supprimer "${userBook.book.title}" de votre bibliothèque ?`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/my-books/${id}/`);
      navigate('/library');
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression du livre.");
    }
  };

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

  if (loading) {
    return (
      <Layout>
        <p>Chargement...</p>
      </Layout>
    );
  }

  if (error && !userBook) {
    return (
      <Layout>
        <p style={{ color: 'red' }}>{error}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <h1>📖 Détail du livre</h1>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

        {userBook && (
          <div style={{ marginTop: 20 }}>
            {/* Informations du livre */}
            <div
              style={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 5,
                boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                marginBottom: 20,
              }}
            >
              <h2>{userBook.book.title}</h2>
              <p>
                <strong>Auteur :</strong> {userBook.book.author?.name}
              </p>
              <p>
                <strong>Total pages :</strong> {userBook.book.total_pages}
              </p>
              <p>
                <strong>Statut :</strong>{' '}
                <span
                  style={{
                    fontWeight: 'bold',
                    color:
                      userBook.status === 'lu'
                        ? 'green'
                        : userBook.status === 'en_cours'
                        ? 'orange'
                        : 'gray',
                  }}
                >
                  {statusLabel(userBook.status)}
                </span>
              </p>
              <p>
                <strong>Progression :</strong> {userBook.progress}%
              </p>
              <ProgressBar value={userBook.progress || 0} />

              <p style={{ marginTop: 10 }}>
                <strong>Date d'ajout :</strong>{' '}
                {new Date(userBook.date_added).toLocaleDateString('fr-FR')}
              </p>
            </div>

            {/* Formulaire de mise à jour */}
            <form onSubmit={handleUpdate}>
              <div
                style={{
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 5,
                  boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                  marginBottom: 20,
                }}
              >
                <h3>Mettre à jour votre lecture</h3>

                <div style={{ marginBottom: 10 }}>
                  <label>
                    <strong>Pages lues :</strong>
                  </label>
                  <br />
                  <input
                    type="number"
                    value={pagesRead}
                    onChange={(e) => setPagesRead(e.target.value)}
                    min="0"
                    max={userBook.book.total_pages}
                    style={{ padding: 5, width: '100%', maxWidth: 200 }}
                  />
                  <span style={{ marginLeft: 10 }}>
                    / {userBook.book.total_pages}
                  </span>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label>
                    <strong>Commentaire :</strong>
                  </label>
                  <br />
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="5"
                    style={{ padding: 5, width: '100%', maxWidth: 500 }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '3px',
                    border: 'none',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    cursor: 'pointer',
                    marginRight: 10,
                  }}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '3px',
                    border: 'none',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Supprimer de ma bibliothèque
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Composant barre de progression
function ProgressBar({ value }) {
  const percent = Math.max(0, Math.min(100, value)); // clamp 0-100
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 400,
        height: '20px',
        backgroundColor: '#ecf0f1',
        borderRadius: '10px',
        overflow: 'hidden',
        marginTop: 5,
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: '100%',
          backgroundColor: '#3498db',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}

export default BookDetail;