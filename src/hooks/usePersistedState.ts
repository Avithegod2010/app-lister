import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePersistedState<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initial);
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key)
      .then((stored) => {
        if (!cancelled && stored != null) setValue(JSON.parse(stored) as T);
      })
      .catch(() => {
        // Stored preferences are optional; keep the default.
      })
      .finally(() => {
        hydrated.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const set = useCallback(
    (next: T) => {
      setValue(next);
      if (hydrated.current) {
        AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
      }
    },
    [key],
  );

  return [value, set];
}
