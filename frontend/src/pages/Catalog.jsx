// src/pages/Catalog.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { FiGrid, FiPlus, FiSearch } from 'react-icons/fi';
import Layout from '../components/Layout';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

function Catalog() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [search, setSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('all');

  const [newTitle, setNewTitle] = useState('');
  const [newAuthorId, setNewAuthorId] = useState('');
  const [newTotalPages, setNewTotalPages] = useState('');

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const toast = useToast();

  const fetchAuthors = useCallback(async () => {
    try {
      const res = await api.get('/authors/');
      setAuthors(extractResults(res.data));
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des auteurs.');
    }
  }, [toast]);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/books/');
      setBooks(extractResults(res.data));
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement du catalogue.');
      toast.error('Erreur lors du chargement du catalogue.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAuthors();
    fetchBooks();
  }, [fetchAuthors, fetchBooks]);

  const handleAddBook = async (e) => {
    e.preventDefault();

    const title = newTitle.trim();
    const pages = parseInt(newTotalPages, 10);

    if (!title || !newAuthorId || !pages || pages <= 0) {
      toast.error('Veuillez remplir correctement tous les champs.');
      return;
    }

    setActionLoading(true);
    try {
      await api.post('/books/', {
        title,
        author_id: parseInt(newAuthorId, 10),
        total_pages: pages,
      });
      toast.success('Livre ajouté au catalogue.');
      setNewTitle('');
      setNewAuthorId('');
      setNewTotalPages('');
      await fetchBooks();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la création du livre.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesAuthor =
      authorFilter === 'all' ? true : book.author?.id === parseInt(authorFilter, 10);
    const matchesSearch =
      search === '' ||
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.name.toLowerCase().includes(search.toLowerCase());
    return matchesAuthor && matchesSearch;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Catalogue de livres"
          subtitle="Liste de tous les livres disponibles dans le catalogue"
          icon={FiGrid}
        />

        {error && <Alert type="error">{error}</Alert>}

        {/* Barre de recherche + filtre auteur */}
        <Card variant="glass">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par titre ou auteur..."
                  className="input-modern pl-12"
                />
              </div>
            </div>
            <div className="w-full sm:w-64">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Filtrer par auteur
              </label>
              <select
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="input-modern"
              >
                <option value="all">Tous les auteurs</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Liste des livres */}
        {loading ? (
          <LoadingSpinner text="Chargement du catalogue..." />
        ) : filteredBooks.length === 0 ? (
          <Card variant="glass">
            <p className="text-center text-gray-400 py-6">
              Aucun livre ne correspond à vos critères.
            </p>
          </Card>
        ) : (
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-white mb-4">
              Livres ({filteredBooks.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-gray-400">Titre</th>
                    <th className="px-4 py-2 text-gray-400">Auteur</th>
                    <th className="px-4 py-2 text-gray-400">Pages</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="border-t border-white/10">
                      <td className="px-4 py-2 text-gray-100">{book.title}</td>
                      <td className="px-4 py-2 text-gray-300">
                        {book.author?.name || 'Auteur inconnu'}
                      </td>
                      <td className="px-4 py-2 text-gray-300">
                        {book.total_pages}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Formulaire ajout livre */}
        <Card variant="glass">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiPlus className="text-primary-400" />
            Ajouter un livre au catalogue
          </h2>
          <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Input
              label="Titre"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex: Le Petit Prince"
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Auteur
              </label>
              <select
                value={newAuthorId}
                onChange={(e) => setNewAuthorId(e.target.value)}
                className="input-modern"
              >
                <option value="">Choisissez un auteur</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Nombre de pages"
              type="number"
              min="1"
              value={newTotalPages}
              onChange={(e) => setNewTotalPages(e.target.value)}
              placeholder="Ex: 300"
            />
            <div className="md:col-span-3">
              <Button
                type="submit"
                variant="primary"
                loading={actionLoading}
                icon={<FiPlus />}
                className="w-full md:w-auto"
              >
                Ajouter au catalogue
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

export default Catalog;