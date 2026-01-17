// src/pages/ListDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

// Utilitaire pour gérer la pagination DRF
const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

function ListDetail() {
  const { id } = useParams(); // ID de la ReadingList
  const navigate = useNavigate();

  const [list, setList] = useState(null);
  const [myBooks, setMyBooks] = useState([]); // bibliothèque pour ajouter
  const [selectedBookId, setSelectedBookId] = useState('');

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchListDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/lists/${id}/`);
      setList(res.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setError('Liste de lecture non trouvée.');
      } else {
        setError('Erreur lors du chargement de la liste.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMyBooks = useCallback(async () => {
    try {
      const res = await api.get('/my-books/');
      setMyBooks(extractResults(res.data));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchListDetail();
    fetchMyBooks();
  }, [fetchListDetail, fetchMyBooks]);

  const handleRemoveBook = async (bookId) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post(`/lists/${id}/remove_book/`, { book_id: bookId });
      setSuccessMsg('Livre retiré de la liste.');
      await fetchListDetail();
    } catch (err) {
      console.error(err);
      setError('Erreur lors du retrait du livre.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBook = async () => {
    if (!selectedBookId) {
      setError('Veuillez sélectionner un livre.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post(`/lists/${id}/add_book/`, { book_id: parseInt(selectedBookId, 10) });
      setSuccessMsg('Livre ajouté à la liste.');
      setSelectedBookId('');
      await fetchListDetail();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        setError(err.response.data.error || 'Ce livre est déjà dans la liste.');
      } else {
        setError("Erreur lors de l'ajout du livre.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Supprimer cette liste de lecture ?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/lists/${id}/`);
      navigate('/lists');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression de la liste.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>Chargement...</p>
      </Layout>
    );
  }

  if (error && !list) {
    return (
      <Layout>
        <p style={{ color: 'red' }}>{error}</p>
      </Layout>
    );
  }

  const books = list.books || [];

  return (
    <Layout>
      <div>
        <h1>📋 {list.name}</h1>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

        <div style={{ marginTop: 10, marginBottom: 20 }}>
          <button
            onClick={handleDelete}
            style={{
              padding: '6px 10px',
              borderRadius: '3px',
              border: 'none',
              backgroundColor: '#e74c3c',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Supprimer cette liste
          </button>
        </div>

        {/* Section : Livres de la liste */}
        <section>
          <h2>Livres dans cette liste ({books.length})</h2>

          {books.length === 0 ? (
            <p>Aucun livre dans cette liste pour l'instant.</p>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                marginTop: 10,
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Titre</th>
                  <th style={thStyle}>Auteur</th>
                  <th style={thStyle}>Pages lues</th>
                  <th style={thStyle}>Statut</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((ub) => (
                  <tr key={ub.id}>
                    <td style={tdStyle}>{ub.book?.title}</td>
                    <td style={tdStyle}>{ub.book?.author?.name}</td>
                    <td style={tdStyle}>
                      {ub.pages_read} / {ub.book?.total_pages}
                    </td>
                    <td style={tdStyle}>
                      {statusLabel(ub.status)}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleRemoveBook(ub.id)}
                        disabled={actionLoading}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '3px',
                          border: 'none',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          cursor: 'pointer',
                        }}
                      >
                        Retirer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Section : Ajouter un livre */}
        <section style={{ marginTop: 30 }}>
          <h2>Ajouter un livre à la liste</h2>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              style={{ padding: 5, minWidth: 250 }}
            >
              <option value="">-- Choisir un livre --</option>
              {myBooks.map((ub) => (
                <option key={ub.id} value={ub.id}>
                  {ub.book.title} — {ub.book.author?.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddBook}
              disabled={actionLoading}
              style={{
                padding: '6px 10px',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: '#27ae60',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Ajouter
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
}

// Styles pour tableau
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

function statusLabel(status) {
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
}

export default ListDetail;