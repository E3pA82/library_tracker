// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiBook, 
  FiPlusCircle, 
  FiTarget, 
  FiList, 
  FiUsers, 
  FiGrid,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const navItems = [
    { to: '/dashboard', icon: FiHome, label: 'Tableau de bord' },
    { to: '/library', icon: FiBook, label: 'Ma Bibliothèque' },
    { to: '/add-book', icon: FiPlusCircle, label: 'Ajouter un livre' },
    { to: '/goals', icon: FiTarget, label: 'Objectifs' },
    { to: '/lists', icon: FiList, label: 'Listes de lecture' },
    { divider: true },
    { to: '/authors', icon: FiUsers, label: 'Auteurs' },
    { to: '/books', icon: FiGrid, label: 'Catalogue' },
  ];

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-500/30">
              <FiBook className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              Library Tracker
            </span>
          </div>
          {/* Bouton fermer (mobile) */}
          <button 
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          item.divider ? (
            <div key={index} className="border-t border-white/10 my-4" />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `nav-link-modern ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        ))}
      </nav>

      {/* Bouton déconnexion */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Bouton menu hamburger (mobile) */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl glass-dark text-white shadow-lg"
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {/* Overlay sombre (mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Desktop - toujours visible */}
      <div className="hidden lg:flex fixed top-0 left-0 w-64 h-screen glass-dark flex-col z-50">
        {sidebarContent}
      </div>

      {/* Sidebar Mobile - conditionnelle */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed top-0 left-0 w-64 h-screen glass-dark flex flex-col z-50"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;