import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import native, {
  addScanProgressListener,
  isNativeAvailable,
  type NativeAppInfo,
  type ScanProgress,
} from 'installed-apps';

type Status = 'loading' | 'ready' | 'error';

interface AppsContextValue {
  status: Status;
  apps: NativeAppInfo[];
  progress: ScanProgress | null;
  error: string | null;
  nativeAvailable: boolean;
  rescan: () => void;
  getApp: (packageName: string) => NativeAppInfo | undefined;
  usageTimes: Record<string, number>;
  usageAccess: boolean;
  refreshUsage: () => void;
  openUsageAccessSettings: () => void;
}

const AppsContext = createContext<AppsContextValue | null>(null);

export function AppsProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [apps, setApps] = useState<NativeAppInfo[]>([]);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usageTimes, setUsageTimes] = useState<Record<string, number>>({});
  const [usageAccess, setUsageAccess] = useState(false);
  const index = useRef(new Map<string, NativeAppInfo>());

  const load = useCallback(async () => {
    if (!isNativeAvailable) {
      setError('The native module is unavailable. Run the app in a development build or the APK.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setProgress(null);
    setError(null);
    try {
      const list = await native.getApps();
      list.sort((a, b) => a.appName.localeCompare(b.appName));
      index.current = new Map(list.map((app) => [app.packageName, app]));
      setApps(list);
      setStatus('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus('error');
    }
  }, []);

  const refreshUsage = useCallback(() => {
    if (!isNativeAvailable) return;
    setUsageAccess(native.hasUsageAccess());
    native
      .getUsageTimes()
      .then((times) => {
        if (times) setUsageTimes(times);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = addScanProgressListener(setProgress);
    load();
    return unsubscribe;
  }, [load]);

  useEffect(() => {
    if (status === 'ready') refreshUsage();
  }, [status, refreshUsage]);

  const rescan = useCallback(() => {
    load();
    refreshUsage();
  }, [load, refreshUsage]);

  const openUsageAccessSettings = useCallback(() => {
    native.openUsageAccessSettings();
  }, []);

  const getApp = useCallback(
    (packageName: string) => index.current.get(packageName),
    [],
  );

  const value = useMemo<AppsContextValue>(
    () => ({
      status,
      apps,
      progress,
      error,
      nativeAvailable: isNativeAvailable,
      rescan,
      getApp,
      usageTimes,
      usageAccess,
      refreshUsage,
      openUsageAccessSettings,
    }),
    [status, apps, progress, error, rescan, getApp, usageTimes, usageAccess, refreshUsage, openUsageAccessSettings],
  );

  return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>;
}

export function useApps(): AppsContextValue {
  const value = useContext(AppsContext);
  if (!value) throw new Error('useApps must be used inside AppsProvider');
  return value;
}
