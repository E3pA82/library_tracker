// src/components/Layout.jsx
import React, { useState, createContext, useContext } from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

// Context pour partager l'état de la sidebar
export const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className={`layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar />
        <main className="layout-main">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}

export default Layout;