// src/components/ui/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';

function Card({ children, className = '', variant = 'glass', hover = true, delay = 0 }) {
  const variants = {
    glass: 'card-modern',
    solid: 'card-solid',
    transparent: 'bg-transparent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`${variants[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default Card;