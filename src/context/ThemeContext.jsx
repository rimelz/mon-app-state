import React, { createContext, useState, useContext, useEffect } from 'react';

// QUAND DECLARER ? Une seule fois, HORS de tout composant React.
// createContext(null) cree l'objet "canal" qui transportera nos donnees.
export const ThemeContext = createContext(null);

// COMMENT FOURNIR ? En creant un composant Provider qui enveloppe {children}
export function ThemeProvider({ children }) {
  // 1. Etat interne du theme (persiste dans localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // 2. Fonction de modification partagee
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 3. Diffusion : tout ce qui est mis dans "value" devient accessible aux enfants
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personnalise : simplifie l'import et detecte l'oubli de <ThemeProvider>
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit etre utilise a l\'interieur d\'un <ThemeProvider>');
  }
  return context; // Retourne directement { theme, toggleTheme }
}
