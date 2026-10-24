import * as Clipboard from 'expo-clipboard';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { NativeAppInfo } from 'installed-apps';
import { formatBytes } from './format';

export type ExportFormat = 'text' | 'csv' | 'json';
export type ExportAction = 'share' | 'copy';

const MIME_TYPES: Record<ExportFormat, string> = {
  text: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
};

const EXTENSIONS: Record<ExportFormat, string> = {
  text: 'txt',
  csv: 'csv',
  json: 'json',
};

function buildText(apps: NativeAppInfo[]): string {
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

function csvCell(value: string | number | boolean): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildCsv(apps: NativeAppInfo[]): string {
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

function buildJson(apps: NativeAppInfo[]): string {
  return JSON.stringify(
    apps.map((a) => ({
      name: a.appName,
      packageName: a.packageName,
      version: a.versionName,
      versionCode: a.versionCode,
      system: a.isSystem,
      installed: a.installTime ? new Date(a.installTime).toISOString() : null,
      updated: a.updateTime ? new Date(a.updateTime).toISOString() : null,
      apkSize: formatBytes(a.apkSizeBytes),
    })),
    null,
    2,
  );
}

function buildContent(format: ExportFormat, apps: NativeAppInfo[]): string {
  switch (format) {
    case 'csv':
      return buildCsv(apps);
    case 'json':
      return buildJson(apps);
    default:
      return buildText(apps);
  }
}

export async function copyExport(
  format: ExportFormat,
  apps: NativeAppInfo[],
): Promise<void> {
  await Clipboard.setStringAsync(buildContent(format, apps));
}

export async function shareExport(
  format: ExportFormat,
  apps: NativeAppInfo[],
): Promise<void> {
  const file = new File(Paths.cache, `app-lister-export.${EXTENSIONS[format]}`);
  file.write(buildContent(format, apps));
  await Sharing.shareAsync(file.uri, {
    mimeType: MIME_TYPES[format],
    dialogTitle: 'Share app list',
  });
}
