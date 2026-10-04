import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => { checkUserAuth(); }, []);

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    try {
      const currentUser = await db.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = () => { db.auth.logout(); };
  const navigateToLogin = () => { db.auth.redirectToLogin(); };
  const refreshUser = async () => { try { const u = await db.auth.me(); setUser(u); } catch {} };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, authChecked, authError, logout, navigateToLogin, refreshUser, checkUserAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
