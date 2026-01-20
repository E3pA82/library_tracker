// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { FiUser, FiSave } from 'react-icons/fi';
import Layout from '../components/Layout';
import PageHeader from '../components/ui/PageHeader';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const BACKEND_BASE_URL = 'http://127.0.0.1:8000'; // à adapter si besoin

function Profile() {
  const { user } = useAuth();
  const toast = useToast();

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bio, setBio] = useState('');
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Charger le profil
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/profile/');
        const data = res.data;
        setBio(data.bio || '');
        setFavoriteGenre(data.favorite_genre || '');
        if (data.avatar) {
          // data.avatar est un chemin comme "/media/avatars/xxx.jpg"
          setAvatarPreview(`${BACKEND_BASE_URL}${data.avatar}`);
        }
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement du profil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      return;
    }
    setAvatarFile(file);
    // Prévisualisation locale
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      formData.append('bio', bio);
      formData.append('favorite_genre', favoriteGenre);

      // Attention : pour multipart, on laisse axios gérer le Content-Type,
      // mais comme notre instance a 'application/json' par défaut,
      // on le surcharge ici.
      await api.patch('/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Profil mis à jour avec succès.');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la mise à jour du profil.');
      toast.error('Erreur lors de la mise à jour du profil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Chargement du profil..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Mon profil"
          subtitle={user?.username ? `Connecté en tant que ${user.username}` : ''}
          icon={FiUser}
        />

        {error && <Alert type="error">{error}</Alert>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne avatar */}
          <div className="card-modern flex flex-col items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-500 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <FiUser className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            <label className="mt-2">
              <span className="text-sm text-gray-300 mb-2 block">
                Photo de profil
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block text-sm text-gray-300
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0
                           file:text-sm file:font-semibold
                           file:bg-primary-500 file:text-white
                           hover:file:bg-primary-600 cursor-pointer"
              />
            </label>
          </div>

          {/* Colonne infos */}
          <div className="card-modern lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nom d'utilisateur
                  </label>
                  <div className="input-modern bg-white/5 border-white/10 text-gray-300">
                    {user?.username || 'Inconnu'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="input-modern min-h-[100px]"
                  placeholder="Parlez un peu de vous, de vos goûts littéraires..."
                />
              </div>

              <Input
                label="Genre littéraire favori"
                value={favoriteGenre}
                onChange={(e) => setFavoriteGenre(e.target.value)}
                placeholder="Ex: Fantasy, Science-fiction, Policier..."
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  icon={<FiSave />}
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;