// frontend/src/context/AuthContext.js
import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(localStorage.getItem('token') ? true : false);

  const login = async (username, password) => {
    const res = await api.post('/login/', { username, password });
    localStorage.setItem('token', res.data.access);
    setUser(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);