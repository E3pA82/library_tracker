// src/pages/AddBook.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

// Utilitaire pour gérer la pagination DRF (results)
const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

function AddBook() {

  // Catalogue existant
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [search, setSearch] = useState('');

  // Formulaire nouveau livre
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [totalPages, setTotalPages] = useState('');

  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBooks = useCallback(async () => {
    setLoadingBooks(true);
    setError('');
    try {
      const res = await api.get('/books/');
      const books = extractResults(res.data);
      setAllBooks(books);
      setFilteredBooks(books);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement du catalogue de livres.");
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Filtrage côté frontend
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    const lower = value.toLowerCase();
    const filtered = allBooks.filter((book) => {
      const titleMatch = book.title.toLowerCase().includes(lower);
      const authorMatch = book.author?.name
        ?.toLowerCase()
        .includes(lower);
      return titleMatch || authorMatch;
    });
    setFilteredBooks(filtered);
  };

  const handleAddExistingBook = async (bookId) => {
    setLoadingAction(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/my-books/', { book_id: bookId });
      setSuccessMsg('Livre ajouté à votre bibliothèque.');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        setError("Ce livre est déjà dans votre bibliothèque.");
      } else {
        setError("Erreur lors de l'ajout du livre à la bibliothèque.");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // Trouver ou créer l'auteur puis créer le livre
  const findOrCreateAuthor = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("Le nom de l'auteur est obligatoire.");
    }

    // Charger tous les auteurs
    const res = await api.get('/authors/');
    const authors = extractResults(res.data);

    const existing = authors.find(
      (a) => a.name.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      return existing.id;
    }

    // Sinon, créer l'auteur
    const createRes = await api.post('/authors/', { name: trimmed });
    return createRes.data.id;
  };

  const handleCreateBookAndAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title.trim() || !authorName.trim() || !totalPages) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    const pages = parseInt(totalPages, 10);
    if (isNaN(pages) || pages <= 0) {
      setError('Le nombre de pages doit être un entier positif.');
      return;
    }

    setLoadingAction(true);

    try {
      // 1. Trouver ou créer l'auteur
      const authorId = await findOrCreateAuthor(authorName);

      // 2. Créer le livre
      const bookRes = await api.post('/books/', {
        title: title.trim(),
        author_id: authorId,
        total_pages: pages,
      });

      const bookId = bookRes.data.id;

      // 3. Ajouter le livre à la bibliothèque personnelle
      await api.post('/my-books/', { book_id: bookId });

      setSuccessMsg('Livre créé et ajouté à votre bibliothèque.');
      setTitle('');
      setAuthorName('');
      setTotalPages('');
      // Optionnel : recharger le catalogue
      fetchBooks();
      // Optionnel : rediriger vers la bibliothèque
      // navigate('/library');
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création ou de l'ajout du livre.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Layout>
      <div>
        <h1>➕ Ajouter un livre</h1>

        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}
        {successMsg && (
          <p style={{ color: 'green' }}>{successMsg}</p>
        )}

        {/* 1. Section : Rechercher dans le catalogue existant */}
        <section style={{ marginTop: 20, marginBottom: 30 }}>
          <h2>Rechercher dans le catalogue existant</h2>
          <input
            type="text"
            placeholder="Rechercher par titre ou auteur"
            value={search}
            onChange={handleSearchChange}
            style={{ padding: 5, width: '100%', maxWidth: 400 }}
          />

          {loadingBooks ? (
            <p>Chargement du catalogue...</p>
          ) : filteredBooks.length === 0 ? (
            <p>Aucun livre trouvé.</p>
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
                  <th style={thStyle}>Pages</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td style={tdStyle}>{book.title}</td>
                    <td style={tdStyle}>{book.author?.name}</td>
                    <td style={tdStyle}>{book.total_pages}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleAddExistingBook(book.id)}
                        disabled={loadingAction}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '3px',
                          border: 'none',
                          backgroundColor: '#27ae60',
                          color: 'white',
                          cursor: 'pointer',
                        }}
                      >
                        Ajouter à ma bibliothèque
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* 2. Section : Créer un nouveau livre */}
        <section>
          <h2>Créer un nouveau livre</h2>
          <form onSubmit={handleCreateBookAndAdd}>
            <div style={{ marginBottom: 10 }}>
              <label>Titre :</label><br />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ padding: 5, width: '100%', maxWidth: 400 }}
                required
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Auteur :</label><br />
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                style={{ padding: 5, width: '100%', maxWidth: 400 }}
                required
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Nombre de pages :</label><br />
              <input
                type="number"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                style={{ padding: 5, width: '100%', maxWidth: 200 }}
                min="1"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingAction}
              style={{
                padding: '8px 12px',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: '#2980b9',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              {loadingAction ? 'En cours...' : 'Créer et ajouter'}
            </button>
          </form>
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

export default AddBook;