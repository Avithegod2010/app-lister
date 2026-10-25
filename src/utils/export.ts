import * as Clipboard from 'expo-clipboard';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { NativeAppInfo } from 'installed-apps';
import { buildContent, type ExportFormat } from './exportContent';

export type { ExportFormat };

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
  const ext = format === 'text' ? 'txt' : format;
  const file = new File(Paths.cache, `app-lister-export.${ext}`);
  file.write(buildContent(format, apps));
  await Sharing.shareAsync(file.uri, {
    mimeType: format === 'csv' ? 'text/csv' : format === 'json' ? 'application/json' : 'text/plain',
    dialogTitle: 'Share app list',
  });
}
