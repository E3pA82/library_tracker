// src/components/ListForm.jsx
import React, { useState } from 'react';
import api from '../services/api';

function ListForm({ onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Le nom de la liste est obligatoire.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/lists/', { name: trimmed });

      setSuccess('Liste créée avec succès.');
      setName('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création de la liste.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 5,
        boxShadow: '0 0 4px rgba(0,0,0,0.1)',
        maxWidth: 400,
      }}
    >
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <div style={{ marginBottom: 10 }}>
        <label><strong>Nom de la liste :</strong></label><br />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 5, width: '100%' }}
          placeholder="Ex : À lire cet été"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '8px 12px',
          borderRadius: '3px',
          border: 'none',
          backgroundColor: '#27ae60',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Création...' : 'Créer la liste'}
      </button>
    </form>
  );
}

export default ListForm;