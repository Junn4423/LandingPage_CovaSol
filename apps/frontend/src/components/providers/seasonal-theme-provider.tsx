'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { SeasonalTheme, ActiveSeasonalThemeResponse } from '@covasol/types';

interface SeasonalThemeContextValue {
  theme: SeasonalTheme | null;
  settings: Record<string, string>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const SeasonalThemeContext = createContext<SeasonalThemeContextValue>({
  theme: null,
  settings: {},
  isLoading: true,
  error: null,
  refetch: async () => {},
});

export function useSeasonalTheme() {
  return useContext(SeasonalThemeContext);
}

interface SeasonalThemeProviderProps {
  children: ReactNode;
}

export function SeasonalThemeProvider({ children }: SeasonalThemeProviderProps) {
  const [theme, setTheme] = useState<SeasonalTheme | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTheme = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiBase}/v1/seasonal-theme/active`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch seasonal theme');
      }

      const result = await response.json();
      const data = result.data as ActiveSeasonalThemeResponse;

      setTheme(data.theme);
      setSettings(data.settings);
    } catch (err) {
      console.error('Error fetching seasonal theme:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Don't crash the app if seasonal theme fails
      setTheme(null);
      setSettings({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();

    // Refetch every 5 minutes to catch any theme changes
    const interval = setInterval(fetchTheme, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SeasonalThemeContext.Provider
      value={{
        theme,
        settings,
        isLoading,
        error,
        refetch: fetchTheme,
      }}
    >
      {children}
    </SeasonalThemeContext.Provider>
  );
}

export default SeasonalThemeProvider;
