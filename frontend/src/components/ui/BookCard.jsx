// src/components/ui/BookCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiBook } from 'react-icons/fi';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import ProgressBar from './ProgressBar';
import Button from './Button';

function BookCard({ 
  book,           // UserBook complet
  onUpdate, 
  onDelete,
  onToggleFavorite,
  onRate,
  delay = 0,
  showActions = true 
}) {
  const statusStyles = {
    non_lu: { bg: 'bg-gray-500/20', text: 'text-gray-300', label: 'Non lu' },
    en_cours: { bg: 'bg-amber-500/20', text: 'text-amber-300', label: 'En cours' },
    lu: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', label: 'Lu' },
  };

  const status = statusStyles[book.status] || statusStyles.non_lu;

  const handleRate = (value) => {
    if (onRate) {
      onRate(book, value);
    }
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onToggleFavorite) {
      onToggleFavorite(book);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="card-modern group relative cursor-pointer"
    >
      {/* Bouton favori (étoile) en haut à droite */}
      <button
        onClick={handleToggleFavorite}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-yellow-400 transition-colors"
        title={book.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        {book.is_favorite ? (
          <AiFillStar className="w-5 h-5" />
        ) : (
          <AiOutlineStar className="w-5 h-5" />
        )}
      </button>

      <div className="flex gap-4">
        {/* Icône / Couverture */}
        <div className="flex-shrink-0 w-16 h-20 rounded-lg bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center">
          <FiBook className="w-8 h-8 text-primary-400" />
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <Link 
            to={`/library/${book.id}`}
            className="text-lg font-semibold text-white hover:text-primary-400 transition-colors truncate block"
          >
            {book.book?.title}
          </Link>
          <p className="text-sm text-gray-400 truncate">
            {book.book?.author?.name || 'Auteur inconnu'}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            <span className="text-sm text-gray-400">
              {book.pages_read}/{book.book?.total_pages} pages
            </span>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mt-4">
        <ProgressBar value={book.progress || 0} color="primary" />
      </div>

      {/* Note (étoiles) */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-gray-400">Note :</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = (book.rating || 0) >= star;
            return (
              <button
                key={star}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleRate(star);
                }}
                className="text-yellow-400 hover:scale-110 transition-transform"
              >
                {filled ? (
                  <AiFillStar className="w-5 h-5" />
                ) : (
                  <AiOutlineStar className="w-5 h-5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
          <Button
            onClick={(e) => {
              e.preventDefault();
              onUpdate && onUpdate(book);
            }}
            variant="secondary"
            icon={<FiEdit2 className="w-4 h-4" />}
            className="flex-1 py-2 text-sm"
          >
            Mettre à jour
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onDelete && onDelete(book);
            }}
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