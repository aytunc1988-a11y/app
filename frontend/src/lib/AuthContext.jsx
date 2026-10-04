import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { db } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null=checking
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const u = await db.auth.me();
      setUser(u); setIsAuthenticated(true);
    } catch {
      setUser(null); setIsAuthenticated(false);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (window.location.hash?.includes('session_id=')) { setLoading(false); return; }
    checkAuth();
  }, [checkAuth]);

  const refreshUser = useCallback(async () => {
    try { const u = await db.auth.me(); setUser(u); setIsAuthenticated(true); return u; } catch {}
  }, []);

  const logout = () => db.auth.logout();

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, isLoadingAuth: loading, checkAuth, refreshUser, setUser, setIsAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
};
