import { requireNativeModule } from 'expo-modules-core';

export interface NativeAppInfo {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  installTime: number;
  updateTime: number;
  isSystem: boolean;
  minSdk: number;
  targetSdk: number;
  category: number;
  apkPath: string;
  apkSizeBytes: number;
  iconPath: string;
}

export interface ScanProgress {
  loaded: number;
  total: number;
}

interface InstalledAppsNativeModule {
  getApps(): Promise<NativeAppInfo[]>;
  launchApp(packageName: string): boolean;
  openAppInfo(packageName: string): void;
  getWallpaperColor(): string | null;
  addListener(event: string, listener: (event: ScanProgress) => void): { remove(): void };
}

// The native module only exists in development builds / the APK, never in
// Expo Go; degrade to a no-op so the JS bundle still loads for web previews.
let native: InstalledAppsNativeModule;
let available = true;
try {
  native = requireNativeModule<InstalledAppsNativeModule>('InstalledApps');
} catch {
  available = false;
  native = {
    getApps: async () => [],
    launchApp: () => false,
    openAppInfo: () => {},
    getWallpaperColor: () => null,
    addListener: () => ({ remove: () => {} }),
  };
}

export const isNativeAvailable = available;

export default native;

export function addScanProgressListener(listener: (event: ScanProgress) => void): () => void {
  try {
    const subscription = native.addListener('onScanProgress', listener);
    return () => subscription.remove();
  } catch {
    return () => {};
  }
}
