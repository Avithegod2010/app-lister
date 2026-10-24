const NAMES: Record<number, string> = {
  21: 'Android 5.0',
  22: 'Android 5.1',
  23: 'Android 6.0',
  24: 'Android 7.0',
  25: 'Android 7.1',
  26: 'Android 8.0',
  27: 'Android 8.1',
  28: 'Android 9',
  29: 'Android 10',
  30: 'Android 11',
  31: 'Android 12',
  32: 'Android 12L',
  33: 'Android 13',
  34: 'Android 14',
  35: 'Android 15',
  36: 'Android 16',
};

export function androidVersionFor(api: number): string {
  if (!api) return '—';
  return NAMES[api] ?? `API ${api}`;
}
