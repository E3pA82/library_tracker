// src/pages/Authors.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { FiUsers, FiPlus, FiTrash2 } from 'react-icons/fi';
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

function Authors() {
  const [authors, setAuthors] = useState([]);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const toast = useToast();

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/authors/');
      setAuthors(extractResults(res.data));
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des auteurs.');
      toast.error('Erreur lors du chargement des auteurs.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleAddAuthor = async (e) => {
    e.preventDefault();
    const name = newAuthorName.trim();
    if (!name) {
      toast.error("Le nom de l'auteur est obligatoire.");
      return;
    }

    setActionLoading(true);
    try {
      await api.post('/authors/', { name });
      setNewAuthorName('');
      toast.success('Auteur ajouté avec succès.');
      await fetchAuthors();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout de l'auteur.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAuthor = async (author) => {
    if (!window.confirm(`Supprimer l'auteur "${author.name}" ?`)) return;

    setActionLoading(true);
    try {
      await api.delete(`/authors/${author.id}/`);
      toast.success('Auteur supprimé.');
      await fetchAuthors();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression de l'auteur.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Auteurs"
          subtitle="Gérez les auteurs de votre catalogue"
          icon={FiUsers}
        />

        {error && <Alert type="error">{error}</Alert>}

        {/* Formulaire ajout auteur */}
        <Card variant="glass">
          <form onSubmit={handleAddAuthor} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Input
                label="Nom de l'auteur"
                value={newAuthorName}
                onChange={(e) => setNewAuthorName(e.target.value)}
                placeholder="Ex: Victor Hugo"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={actionLoading}
              icon={<FiPlus />}
              className="w-full sm:w-auto"
            >
              Ajouter
            </Button>
          </form>
        </Card>

        {/* Liste des auteurs */}
        {loading ? (
          <LoadingSpinner text="Chargement des auteurs..." />
        ) : authors.length === 0 ? (
          <Card variant="glass">
            <p className="text-center text-gray-400 py-6">
              Aucun auteur pour le moment. Ajoutez-en un ci-dessus.
            </p>
          </Card>
        ) : (
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-white mb-4">
              Liste des auteurs ({authors.length})
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {authors.map((author) => (
                <div
                  key={author.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-gray-100">{author.name}</span>
                  <Button
                    variant="danger"
                    icon={<FiTrash2 className="w-4 h-4" />}
                    onClick={() => handleDeleteAuthor(author)}
                    className="px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default Authors;