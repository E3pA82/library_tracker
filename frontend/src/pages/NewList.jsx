// src/pages/NewList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ListForm from '../components/ListForm';

function NewList() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Après création, retourner à la liste des listes
    navigate('/lists');
  };

  return (
    <Layout>
      <div>
        <h1>Créer une liste de lecture</h1>
        <p>Donnez un nom à votre nouvelle liste.</p>

        <div style={{ marginTop: 20 }}>
          <ListForm onSuccess={handleSuccess} />
        </div>
      </div>
    </Layout>
  );
}

export default NewList;