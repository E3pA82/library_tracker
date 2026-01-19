// src/components/ui/StatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

function StatCard({ label, value, icon: Icon, color = 'from-primary-500 to-primary-600', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card-modern group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <motion.p 
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
          >
            {value}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;