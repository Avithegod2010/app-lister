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

export const ACCENT_PRESETS: { hex: string; label: string }[] = [
  { hex: '#6750A4', label: 'Violet' },
  { hex: '#3A55E0', label: 'Blue' },
  { hex: '#00687A', label: 'Cyan' },
  { hex: '#386A20', label: 'Green' },
  { hex: '#8B5000', label: 'Amber' },
  { hex: '#B3261E', label: 'Red' },
  { hex: '#8E4957', label: 'Rose' },
  { hex: '#46484F', label: 'Slate' },
];

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

function parseHex(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 6 ? clean : clean.slice(-6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function blend(over: string, base: string, alpha: number): string {
  const a = parseHex(over);
  const b = parseHex(base);
  const mix = (x: number, y: number) => Math.round(x * alpha + y * (1 - alpha));
  const hex = (mix(a.r, b.r) << 16) | (mix(a.g, b.g) << 8) | mix(a.b, b.b);
  return `#${hex.toString(16).padStart(6, '0')}`;
}

export function buildTokens(sourceColor: string, dark: boolean, amoled = false): ThemeTokens {
  const theme = themeFromSourceColor(argbFromHex(sourceColor));
  const scheme = dark ? theme.schemes.dark : theme.schemes.light;
  const tokens: ThemeTokens = {
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

  if (dark && amoled) {
    // True-black surfaces with a whisper of the accent hue for containers,
    // so the list keeps depth without the grey tint of standard dark mode.
    tokens.surface = '#000000';
    tokens.surfaceDim = '#000000';
    tokens.surfaceContainerLow = blend(tokens.primary, '#000000', 0.05);
    tokens.surfaceContainer = blend(tokens.primary, '#000000', 0.09);
    tokens.surfaceContainerHigh = blend(tokens.primary, '#000000', 0.13);
    tokens.primaryContainer = blend(tokens.primary, '#000000', 0.24);
  }
  return tokens;
}
