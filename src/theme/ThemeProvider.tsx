import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import native from 'installed-apps';
import { buildTokens, FALLBACK_SOURCE, type ThemeMode, type ThemeTokens } from './tokens';

const MODE_KEY = 'app-lister.theme.mode';
const SOURCE_KEY = 'app-lister.theme.source';

interface ThemeContextValue {
  tokens: ThemeTokens;
  dark: boolean;
  mode: ThemeMode;
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [sourceColor, setSourceColor] = useState(FALLBACK_SOURCE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedMode, storedColor] = await Promise.all([
          AsyncStorage.getItem(MODE_KEY),
          AsyncStorage.getItem(SOURCE_KEY),
        ]);
        if (cancelled) return;
        if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
          setModeState(storedMode);
        }
        if (storedColor) setSourceColor(storedColor);
      } catch {
        // Preferences are best-effort; defaults are fine without them.
      }
      try {
        const wallpaperColor = native.getWallpaperColor();
        if (!cancelled && wallpaperColor && wallpaperColor !== sourceColor) {
          setSourceColor(wallpaperColor);
          AsyncStorage.setItem(SOURCE_KEY, wallpaperColor).catch(() => {});
        }
      } catch {
        // Wallpaper colors are a bonus; the fallback palette stays.
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dark = mode === 'system' ? systemScheme !== 'light' : mode === 'dark';

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(MODE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ tokens: buildTokens(sourceColor, dark), dark, mode, hydrated, setMode }),
    [sourceColor, dark, mode, hydrated, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
