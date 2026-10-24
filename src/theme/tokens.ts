import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeTokens {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  surface: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceDim: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  error: string;
  errorContainer: string;
  onError: string;
  onErrorContainer: string;
  inverseSurface: string;
  inverseOnSurface: string;
  scrim: string;
}

export const FALLBACK_SOURCE = '#6750A4';

// Older material-color-utilities builds lack the surfaceContainer roles;
// fall back through the closest available role instead of crashing.
function role(scheme: object, ...names: string[]): string {
  const roles = scheme as Record<string, unknown>;
  for (const name of names) {
    const value = roles[name];
    if (typeof value === 'number') return hexFromArgb(value);
  }
  return '#000000';
}

export function buildTokens(sourceColor: string, dark: boolean): ThemeTokens {
  const theme = themeFromSourceColor(argbFromHex(sourceColor));
  const scheme = dark ? theme.schemes.dark : theme.schemes.light;
  return {
    primary: role(scheme, 'primary'),
    onPrimary: role(scheme, 'onPrimary'),
    primaryContainer: role(scheme, 'primaryContainer'),
    onPrimaryContainer: role(scheme, 'onPrimaryContainer'),
    secondaryContainer: role(scheme, 'secondaryContainer'),
    onSecondaryContainer: role(scheme, 'onSecondaryContainer'),
    tertiaryContainer: role(scheme, 'tertiaryContainer'),
    onTertiaryContainer: role(scheme, 'onTertiaryContainer'),
    surface: role(scheme, 'surface'),
    surfaceContainerLow: role(scheme, 'surfaceContainerLow', 'surfaceVariant', 'surface'),
    surfaceContainer: role(scheme, 'surfaceContainer', 'surfaceVariant', 'surface'),
    surfaceContainerHigh: role(scheme, 'surfaceContainerHigh', 'surfaceVariant', 'surface'),
    surfaceDim: role(scheme, 'surfaceDim', 'surface'),
    onSurface: role(scheme, 'onSurface'),
    onSurfaceVariant: role(scheme, 'onSurfaceVariant'),
    outline: role(scheme, 'outline'),
    outlineVariant: role(scheme, 'outlineVariant'),
    error: role(scheme, 'error'),
    errorContainer: role(scheme, 'errorContainer'),
    onError: role(scheme, 'onError'),
    onErrorContainer: role(scheme, 'onErrorContainer'),
    inverseSurface: role(scheme, 'inverseSurface', 'onSurface'),
    inverseOnSurface: role(scheme, 'inverseOnSurface', 'surface'),
    scrim: role(scheme, 'scrim'),
  };
}
