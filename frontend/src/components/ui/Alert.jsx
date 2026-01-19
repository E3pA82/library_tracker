// src/components/ui/Alert.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

function Alert({ type = 'error', children, onClose }) {
  const styles = {
    error: {
      bg: 'bg-red-500/10 border-red-500/30',
      text: 'text-red-300',
      icon: FiAlertCircle,
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      text: 'text-emerald-300',
      icon: FiCheckCircle,
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      text: 'text-amber-300',
      icon: FiAlertTriangle,
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      text: 'text-blue-300',
      icon: FiInfo,
    },
  };

  const { bg, text, icon: Icon } = styles[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${bg} ${text} border rounded-xl px-4 py-3 mb-4 flex items-center gap-3`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1">{children}</span>
        {onClose && (
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <FiX className="w-5 h-5" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default Alert;