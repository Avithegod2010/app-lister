export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const text = unit === 0 || value >= 100 ? Math.round(value).toString() : value.toFixed(1);
  return `${text} ${units[unit]}`;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatDate(ms: number): string {
  if (!ms) return '—';
  try {
    return dateFormatter.format(new Date(ms));
  } catch {
    return '—';
  }
}

export function letterFor(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
}

const CATEGORY_LABELS: Record<number, string> = {
  0: 'Game',
  1: 'Audio',
  2: 'Video',
  3: 'Images',
  4: 'Social',
  5: 'News',
  6: 'Maps',
  7: 'Productivity',
  8: 'Accessibility',
};

export function categoryLabel(category: number): string {
  return CATEGORY_LABELS[category] ?? 'Uncategorized';
}

const INSTALLER_LABELS: Record<string, string> = {
  'com.android.vending': 'Google Play Store',
  'com.sec.android.app.samsungapps': 'Galaxy Store',
  'com.amazon.venezia': 'Amazon Appstore',
  'org.mozilla.fennec_fdroid': 'F-Droid',
  'com.heytap.market': 'OPPO App Market',
  'com.tencent.android.qqdownloader': 'Play Store (Tencent mirror)',
};

export function installerLabel(installer: string): string {
  if (!installer) return 'Sideloaded';
  return INSTALLER_LABELS[installer] ?? installer;
}
