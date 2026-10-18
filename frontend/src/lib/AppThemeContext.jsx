import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";

const STORAGE_KEY = "lapquiz_theme";
const AppThemeContext = createContext(null);

function readStoredTheme() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function AppThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState(readStoredTheme);

  const setTheme = useCallback((value) => {
    const nextTheme = value === "dark" ? "dark" : "light";
    setThemeState(nextTheme);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The profile setting is still saved to the account when changes are submitted.
    }
  }, []);

  useEffect(() => {
    if (user) setTheme(user.theme === "dark" ? "dark" : "light");
  }, [user, setTheme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector(".App")?.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <AppThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) throw new Error("useAppTheme must be used within AppThemeProvider");
  return context;
}
