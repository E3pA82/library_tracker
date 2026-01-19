// src/pages/Library.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiPlus, FiSearch } from 'react-icons/fi';
import Layout from '../components/Layout';
import api from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import BookCard from '../components/ui/BookCard';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useToast } from '../context/ToastContext';

const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

function Library() {
  const [books, setBooks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal de mise à jour
  const [updateModal, setUpdateModal] = useState({ isOpen: false, book: null });
  const [pagesInput, setPagesInput] = useState('');

  const toast = useToast();

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/my-books/');
      setBooks(extractResults(res.data));
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement de votre bibliothèque.');
      toast.error('Erreur lors du chargement de votre bibliothèque.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const openUpdateModal = (book) => {
    setUpdateModal({ isOpen: true, book });
    setPagesInput(book.pages_read || 0);
  };

  const closeUpdateModal = () => {
    setUpdateModal({ isOpen: false, book: null });
    setPagesInput('');
  };

  const handleUpdateProgress = async () => {
    const book = updateModal.book;
    const pages = parseInt(pagesInput, 10);
    
    if (isNaN(pages) || pages < 0 || pages > book.book.total_pages) {
      toast.error(`Entrez un nombre entre 0 et ${book.book.total_pages}.`);
      return;
    }

    try {
      await api.post(`/my-books/${book.id}/update_progress/`, { pages_read: pages });
      toast.success('Progression mise à jour avec succès !');
      closeUpdateModal();
      await fetchBooks();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour.');
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Supprimer "${book.book.title}" de votre bibliothèque ?`)) {
      return;
    }

    try {
      await api.delete(`/my-books/${book.id}/`);
      toast.success('Livre supprimé de votre bibliothèque.');
      await fetchBooks();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la suppression.');
    }
  };

  // Filtrage
  const filteredBooks = books.filter((ub) => {
    const matchesStatus = filterStatus === 'all' || ub.status === filterStatus;
    const matchesSearch = 
      searchQuery === '' ||
      ub.book?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ub.book?.author?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusFilters = [
    { value: 'all', label: 'Tous' },
    { value: 'non_lu', label: 'Non lus' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'lu', label: 'Lus' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Ma Bibliothèque"
          subtitle={`${books.length} livre${books.length > 1 ? 's' : ''} dans votre collection`}
          icon={FiBook}
          action={
            <Link to="/add-book">
              <Button variant="primary" icon={<FiPlus />}>
                Ajouter un livre
              </Button>
            </Link>
          }
        />

        {error && <Alert type="error">{error}</Alert>}

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre ou auteur..."
                className="input-modern pl-12"
              />
            </div>
          </div>

          {/* Filtres de statut */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filterStatus === filter.value
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des livres */}
        {loading ? (
          <LoadingSpinner text="Chargement de votre bibliothèque..." />
        ) : filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-modern text-center py-12"
          >
            <FiBook className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {searchQuery || filterStatus !== 'all'
                ? 'Aucun livre ne correspond à vos critères.'
                : 'Votre bibliothèque est vide.'}
            </p>
            <Link to="/add-book">
              <Button variant="primary" className="mt-4">
                Ajouter votre premier livre
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBooks.map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                delay={index * 0.05}
                onUpdate={openUpdateModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de mise à jour */}
      <Modal
        isOpen={updateModal.isOpen}
        onClose={closeUpdateModal}
        title="Mettre à jour la progression"
      >
        {updateModal.book && (
          <div className="space-y-4">
            <p className="text-gray-300">
              <strong>{updateModal.book.book?.title}</strong>
            </p>
            <Input
              label={`Pages lues (max ${updateModal.book.book?.total_pages})`}
              type="number"
              min="0"
              max={updateModal.book.book?.total_pages}
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
            />
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={closeUpdateModal} className="flex-1">
                Annuler
              </Button>
              <Button variant="primary" onClick={handleUpdateProgress} className="flex-1">
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}

export default Library;