// src/pages/BookDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiBookOpen, FiArrowLeft, FiTrash2, FiSave } from 'react-icons/fi';
import Layout from '../components/Layout';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
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

function BookDetail() {
  const { id } = useParams(); // id du UserBook
  const navigate = useNavigate();
  const toast = useToast();

  const [userBook, setUserBook] = useState(null);
  const [pagesRead, setPagesRead] = useState('');
  const [comment, setComment] = useState('');
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Formulaire pour nouvelle session
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [sessionPages, setSessionPages] = useState('');
  const [sessionDuration, setSessionDuration] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

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

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await api.get('/reading-sessions/', {
        params: { user_book: id, ordering: '-date' },
      });
      setSessions(extractResults(res.data));
    } catch (err) {
      console.error(err);
      // pas de blocage si erreur ici
    } finally {
      setLoadingSessions(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookDetail();
    fetchSessions();
  }, [fetchBookDetail, fetchSessions]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!userBook) return;
    setSaving(true);
    setError('');
    try {
      const pages = parseInt(pagesRead, 10);
      if (isNaN(pages) || pages < 0 || pages > userBook.book.total_pages) {
        toast.error(
          `Le nombre de pages doit être entre 0 et ${userBook.book.total_pages}.`
        );
        setSaving(false);
        return;
      }

      // Mettre à jour les pages lues
      await api.post(`/my-books/${id}/update_progress/`, { pages_read: pages });

      // Mettre à jour le commentaire
      await api.patch(`/my-books/${id}/`, { comment });

      toast.success('Livre mis à jour avec succès.');
      await fetchBookDetail();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour du livre.");
      toast.error("Erreur lors de la mise à jour du livre.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async () => {
    if (
      !window.confirm(
        `Supprimer "${userBook.book.title}" de votre bibliothèque ?`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/my-books/${id}/`);
      toast.success('Livre supprimé de votre bibliothèque.');
      navigate('/library');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression du livre.");
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!userBook) return;

    const pages = parseInt(sessionPages, 10);
    if (isNaN(pages) || pages <= 0) {
      toast.error("Le nombre de pages doit être supérieur à 0.");
      return;
    }

    try {
      await api.post('/reading-sessions/', {
        user_book: userBook.id,
        date: sessionDate,
        pages_read: pages,
        duration_minutes: sessionDuration ? parseInt(sessionDuration, 10) : null,
        notes: sessionNotes,
      });

      toast.success('Session de lecture ajoutée.');
      // Réinitialiser le formulaire
      setSessionPages('');
      setSessionDuration('');
      setSessionNotes('');
      // Recharger les sessions et le livre (progression mise à jour)
      await fetchSessions();
      await fetchBookDetail();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout de la session.");
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

  const statusColor = (status) => {
    switch (status) {
      case 'non_lu':
        return 'bg-gray-500/20 text-gray-300';
      case 'en_cours':
        return 'bg-amber-500/20 text-amber-300';
      case 'lu':
        return 'bg-emerald-500/20 text-emerald-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading && !userBook) {
    return (
      <Layout>
        <LoadingSpinner text="Chargement du livre..." />
      </Layout>
    );
  }

  if (error && !userBook) {
    return (
      <Layout>
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            icon={<FiArrowLeft />}
          >
            Retour
          </Button>
          <Alert type="error">{error}</Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title={userBook?.book?.title || 'Détail du livre'}
            subtitle={userBook?.book?.author?.name}
            icon={FiBookOpen}
          />
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            icon={<FiArrowLeft />}
            className="hidden sm:inline-flex"
          >
            Retour
          </Button>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {/* Bloc principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche : infos livre + formulaire maj */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="glass">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Informations générales
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Statut, progression et métadonnées du livre.
                  </p>
                </div>
                {userBook && (
                  <span
                    className={`badge ${statusColor(
                      userBook.status
                    )} border border-white/10`}
                  >
                    {statusLabel(userBook.status)}
                  </span>
                )}
              </div>

              {userBook && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Titre</p>
                      <p className="text-white font-medium">
                        {userBook.book.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Auteur</p>
                      <p className="text-white">
                        {userBook.book.author?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Nombre de pages</p>
                      <p className="text-white">
                        {userBook.book.total_pages} pages
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Date d'ajout</p>
                      <p className="text-white">
                        {new Date(
                          userBook.date_added
                        ).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <ProgressBar
                      value={userBook.progress || 0}
                      color="primary"
                      showPercentage
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {userBook.pages_read}/{userBook.book.total_pages} pages
                      lues
                    </p>
                  </div>
                </>
              )}
            </Card>

            {/* Formulaire mise à jour progression & commentaire */}
            <Card variant="glass">
              <form onSubmit={handleUpdate} className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <FiSave className="text-primary-400" />
                  Mettre à jour la lecture
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={
                      userBook
                        ? `Pages lues (max ${userBook.book.total_pages})`
                        : 'Pages lues'
                    }
                    type="number"
                    min="0"
                    max={userBook ? userBook.book.total_pages : undefined}
                    value={pagesRead}
                    onChange={(e) => setPagesRead(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Commentaire
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="input-modern min-h-[100px]"
                    placeholder="Vos impressions sur ce livre..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={saving}
                    icon={<FiSave />}
                    className="flex-1"
                  >
                    Enregistrer
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDeleteBook}
                    icon={<FiTrash2 />}
                  >
                    Supprimer
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Colonne droite : sessions de lecture */}
          <div className="space-y-4">
            {/* Formulaire création session */}
            <Card variant="glass">
              <h2 className="text-lg font-semibold text-white mb-3">
                Ajouter une session de lecture
              </h2>
              <form onSubmit={handleAddSession} className="space-y-3">
                <Input
                  label="Date"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                />
                <Input
                  label="Pages lues"
                  type="number"
                  min="1"
                  value={sessionPages}
                  onChange={(e) => setSessionPages(e.target.value)}
                  placeholder="Ex: 20"
                />
                <Input
                  label="Durée (minutes)"
                  type="number"
                  min="1"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  placeholder="Facultatif"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    rows={3}
                    className="input-modern min-h-[70px]"
                    placeholder="Résumé de votre session (facultatif)"
                  />
                </div>

                <Button
                  type="submit"
                  variant="success"
                  className="w-full"
                >
                  Ajouter la session
                </Button>
              </form>
            </Card>

            {/* Liste des sessions */}
            <Card variant="glass">
              <h2 className="text-lg font-semibold text-white mb-3">
                Sessions de lecture
              </h2>
              {loadingSessions ? (
                <LoadingSpinner text="Chargement des sessions..." />
              ) : sessions.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  Aucune session enregistrée pour ce livre.
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-start p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                    >
                      <div>
                        <p className="text-gray-300 font-medium">
                          {s.date} – +{s.pages_read} pages
                        </p>
                        {s.duration_minutes && (
                          <p className="text-gray-400">
                            {s.duration_minutes} min
                          </p>
                        )}
                        {s.notes && (
                          <p className="text-gray-400 mt-1">
                            {s.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default BookDetail;