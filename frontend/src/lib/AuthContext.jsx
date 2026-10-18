import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { db } from '@/api/base44Client';
import { disableLocalPreview, getPreviewUser, isPreviewEnabled, PREVIEW_USER } from '@/lib/previewMode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [previewMode] = useState(() => isPreviewEnabled());
  const [user, setUser] = useState(() => previewMode ? getPreviewUser() : null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => previewMode ? true : null); // null=checking
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    if (previewMode) {
      setUser(getPreviewUser() || PREVIEW_USER);
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const u = await db.auth.me();
      setUser(u); setIsAuthenticated(true);
    } catch {
      setUser(null); setIsAuthenticated(false);
    } finally { setLoading(false); }
  }, [previewMode]);

  useEffect(() => {
    if (window.location.hash?.includes('session_id=')) { setLoading(false); return; }
    if (previewMode) { setLoading(false); return; }
    checkAuth();
  }, [checkAuth, previewMode]);

  const refreshUser = useCallback(async () => {
    if (previewMode) {
      const u = getPreviewUser() || PREVIEW_USER;
      setUser(u);
      setIsAuthenticated(true);
      return u;
    }
    try { const u = await db.auth.me(); setUser(u); setIsAuthenticated(true); return u; } catch {}
  }, [previewMode]);

  const logout = () => {
    if (previewMode) {
      disableLocalPreview();
      window.location.href = "/";
      return;
    }
    return db.auth.logout();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, isLoadingAuth: loading, previewMode, checkAuth, refreshUser, setUser, setIsAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
};
