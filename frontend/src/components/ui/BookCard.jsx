// src/components/ui/BookCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiBook } from 'react-icons/fi';
import ProgressBar from './ProgressBar';
import Button from './Button';

function BookCard({ 
  book, 
  onUpdate, 
  onDelete, 
  delay = 0,
  showActions = true 
}) {
  const statusStyles = {
    non_lu: { bg: 'bg-gray-500/20', text: 'text-gray-300', label: 'Non lu' },
    en_cours: { bg: 'bg-amber-500/20', text: 'text-amber-300', label: 'En cours' },
    lu: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', label: 'Lu' },
  };

  const status = statusStyles[book.status] || statusStyles.non_lu;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="card-modern group"
    >
      <div className="flex gap-4">
        {/* Icône livre */}
        <div className="flex-shrink-0 w-16 h-20 rounded-lg bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center">
          <FiBook className="w-8 h-8 text-primary-400" />
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <Link 
            to={`/library/${book.id}`}
            className="text-lg font-semibold text-white hover:text-primary-400 transition-colors truncate block"
          >
            {book.book?.title || book.title}
          </Link>
          <p className="text-sm text-gray-400 truncate">
            {book.book?.author?.name || book.author?.name || 'Auteur inconnu'}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            <span className="text-sm text-gray-500">
              {book.pages_read || 0}/{book.book?.total_pages || book.total_pages} pages
            </span>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Progression</span>
          <span>{book.progress || 0}%</span>
        </div>
        <ProgressBar value={book.progress || 0} />
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
          <Button
            onClick={() => onUpdate && onUpdate(book)}
            variant="secondary"
            icon={<FiEdit2 className="w-4 h-4" />}
            className="flex-1 py-2 text-sm"
          >
            Mettre à jour
          </Button>
          <Button
            onClick={() => onDelete && onDelete(book)}
            variant="danger"
            icon={<FiTrash2 className="w-4 h-4" />}
            className="py-2"
          />
        </div>
      )}
    </motion.div>
  );
}

export default BookCard;