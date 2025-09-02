import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'ocean';

const THEME_STORAGE_KEY = 'econest-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      return stored || 'light';
    }
    return 'light';
  });

  const applyTheme = useCallback((newTheme: Theme) => {
    const htmlElement = document.documentElement;
    
    // Удаляем все существующие классы тем
    htmlElement.classList.remove('light', 'dark', 'ocean', 'spooky');
    
    // Добавляем новый класс темы
    if (newTheme !== 'light') {
      htmlElement.classList.add(newTheme);
    }
    
    // Сохраняем в localStorage
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  const changeTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Применяем тему при инициализации
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  return {
    theme,
    changeTheme,
    themes: ['light', 'dark', 'ocean'] as const,
  };
}