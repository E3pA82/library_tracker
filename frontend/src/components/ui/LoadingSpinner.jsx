// src/components/ui/LoadingSpinner.jsx
import React from 'react';
import { motion } from 'framer-motion';

function LoadingSpinner({ size = 'md', text = 'Chargement...' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} rounded-full border-4 border-primary-500/30 border-t-primary-500`}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-gray-400"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export default LoadingSpinner;