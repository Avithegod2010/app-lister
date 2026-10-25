import type { NativeAppInfo } from 'installed-apps';

export type ExportFormat = 'text' | 'csv' | 'json';

export function csvCell(value: string | number | boolean): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildText(apps: NativeAppInfo[]): string {
  const user = apps.filter((a) => !a.isSystem).length;
  const lines = apps.map(
    (a, i) =>
      `${i + 1}. ${a.appName} (${a.packageName}) — v${a.versionName}` +
      (a.isSystem ? ' [system]' : ''),
  );
  return [
    `App Lister export — ${new Date().toLocaleString()}`,
    `${apps.length} apps · ${user} user · ${apps.length - user} system`,
    '',
    ...lines,
  ].join('\n');
}

export function buildCsv(apps: NativeAppInfo[]): string {
  const header = 'name,package,version,is_system,installed,updated,apk_size_bytes';
  const rows = apps.map((a) =>
    [
      csvCell(a.appName),
      csvCell(a.packageName),
      csvCell(a.versionName),
      csvCell(a.isSystem),
      csvCell(new Date(a.installTime).toISOString()),
      csvCell(new Date(a.updateTime).toISOString()),
      csvCell(a.apkSizeBytes),
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

export function buildJson(apps: NativeAppInfo[]): string {
  return JSON.stringify(
    apps.map((a) => ({
      name: a.appName,
      packageName: a.packageName,
      version: a.versionName,
      versionCode: a.versionCode,
      system: a.isSystem,
      installed: a.installTime ? new Date(a.installTime).toISOString() : null,
      updated: a.updateTime ? new Date(a.updateTime).toISOString() : null,
      apkSizeBytes: a.apkSizeBytes,
    })),
    null,
    2,
  );
}

export function buildContent(format: ExportFormat, apps: NativeAppInfo[]): string {
  switch (format) {
    case 'csv':
      return buildCsv(apps);
    case 'json':
      return buildJson(apps);
    default:
      return buildText(apps);
  }
}
