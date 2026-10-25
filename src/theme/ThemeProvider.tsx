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
import {
  buildTokens,
  FALLBACK_SOURCE,
  type ThemeMode,
  type ThemeTokens,
} from './tokens';

const MODE_KEY = 'app-lister.theme.mode';
const SOURCE_KEY = 'app-lister.theme.source';
const WALLPAPER_KEY = 'app-lister.theme.wallpaper';
const AMOLED_KEY = 'app-lister.theme.amoled';

interface ThemeContextValue {
  tokens: ThemeTokens;
  dark: boolean;
  mode: ThemeMode;
  hydrated: boolean;
  sourceColor: string;
  useWallpaper: boolean;
  amoled: boolean;
  setMode: (mode: ThemeMode) => void;
  setSourceColor: (hex: string) => void;
  setUseWallpaper: (enabled: boolean) => void;
  setAmoled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [sourceColor, setSourceColorState] = useState(FALLBACK_SOURCE);
  const [useWallpaper, setUseWallpaperState] = useState(true);
  const [amoled, setAmoledState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedMode, storedColor, storedWallpaper, storedAmoled] = await Promise.all([
          AsyncStorage.getItem(MODE_KEY),
          AsyncStorage.getItem(SOURCE_KEY),
          AsyncStorage.getItem(WALLPAPER_KEY),
          AsyncStorage.getItem(AMOLED_KEY),
        ]);
        if (cancelled) return;
        if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
          setModeState(storedMode);
        }
        if (storedColor) setSourceColorState(storedColor);
        setUseWallpaperState(storedWallpaper !== '0');
        setAmoledState(storedAmoled === '1');
      } catch {
        // Preferences are best-effort; defaults are fine without them.
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Pick up the wallpaper color whenever dynamic theming is (re-)enabled.
  useEffect(() => {
    if (!hydrated || !useWallpaper) return;
    try {
      const wallpaperColor = native.getWallpaperColor();
      if (wallpaperColor) {
        setSourceColorState(wallpaperColor);
        AsyncStorage.setItem(SOURCE_KEY, wallpaperColor).catch(() => {});
      }
    } catch {
      // Wallpaper colors are a bonus; the fallback palette stays.
    }
  }, [hydrated, useWallpaper]);

  const dark = mode === 'system' ? systemScheme !== 'light' : mode === 'dark';

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(MODE_KEY, next).catch(() => {});
  }, []);

  const setSourceColor = useCallback((hex: string) => {
    setSourceColorState(hex);
    setUseWallpaperState(false);
    AsyncStorage.setItem(SOURCE_KEY, hex).catch(() => {});
    AsyncStorage.setItem(WALLPAPER_KEY, '0').catch(() => {});
  }, []);

  const setUseWallpaper = useCallback((enabled: boolean) => {
    setUseWallpaperState(enabled);
    AsyncStorage.setItem(WALLPAPER_KEY, enabled ? '1' : '0').catch(() => {});
  }, []);

  const setAmoled = useCallback((enabled: boolean) => {
    setAmoledState(enabled);
    AsyncStorage.setItem(AMOLED_KEY, enabled ? '1' : '0').catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      tokens: buildTokens(sourceColor, dark, amoled),
      dark,
      mode,
      hydrated,
      sourceColor,
      useWallpaper,
      amoled,
      setMode,
      setSourceColor,
      setUseWallpaper,
      setAmoled,
    }),
    [sourceColor, dark, mode, hydrated, useWallpaper, amoled, setMode, setSourceColor, setUseWallpaper, setAmoled],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
