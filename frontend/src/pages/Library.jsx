// frontend/src/pages/Library.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Library() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    api.get('/my-books/').then(res => setBooks(res.data));
  }, []);

  const updateProgress = async (id, pages) => {
    await api.post(`/my-books/${id}/update_progress/`, { pages_read: pages });
    api.get('/my-books/').then(res => setBooks(res.data));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Ma Bibliothèque</h1>
      
      {books.map(ub => (
        <div key={ub.id} style={{ border: '1px solid #ccc', padding: 10, margin: 10 }}>
          <h3>{ub.book.title}</h3>
          <p>Auteur: {ub.book.author.name}</p>
          <p>Statut: {ub.status}</p>
          <p>Progression: {ub.progress}% ({ub.pages_read}/{ub.book.total_pages} pages)</p>
          <input
            type="number"
            defaultValue={ub.pages_read}
            onBlur={(e) => updateProgress(ub.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}