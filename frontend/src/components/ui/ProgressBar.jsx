// src/components/ui/ProgressBar.jsx
import React from 'react';
import { motion } from 'framer-motion';

function ProgressBar({ value, color = 'primary', showPercentage = false, animated = true }) {
  const percent = Math.max(0, Math.min(100, value));
  
  const colors = {
    primary: 'from-primary-500 to-purple-500',
    success: 'from-emerald-500 to-green-500',
    warning: 'from-amber-500 to-orange-500',
    danger: 'from-red-500 to-rose-500',
  };

  return (
    <div className="w-full">
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Progression</span>
          <span>{percent}%</span>
        </div>
      )}
      <div className="progress-bar">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`progress-bar-fill bg-gradient-to-r ${colors[color]} ${animated ? 'animate-shimmer' : ''}`}
          style={{
            backgroundSize: animated ? '200% 100%' : '100% 100%',
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;