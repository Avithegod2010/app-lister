import { androidVersionFor } from '../src/utils/androidVersions';
import { categoryLabel, formatBytes, formatDate, installerLabel, letterFor } from '../src/utils/format';

describe('formatBytes', () => {
  it('formats bytes, KB, MB and GB', () => {
    expect(formatBytes(0)).toBe('—');
    expect(formatBytes(-5)).toBe('—');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(formatBytes(3 * 1024 * 1024 * 1024)).toBe('3.0 GB');
  });

  it('keeps counting GB beyond the last unit', () => {
    expect(formatBytes(5 * 1024 ** 5)).toBe('5242880 GB');
  });
});

describe('formatDate', () => {
  it('formats a timestamp or falls back to a dash', () => {
    expect(formatDate(0)).toBe('—');
    expect(formatDate(new Date(2024, 0, 15).getTime())).toContain('2024');
  });
});

describe('letterFor', () => {
  it('returns the uppercased first letter', () => {
    expect(letterFor('Calculator')).toBe('C');
    expect(letterFor('  whatsapp')).toBe('W');
  });

  it('maps non-letters to #', () => {
    expect(letterFor('1.1.1.1')).toBe('#');
    expect(letterFor('')).toBe('#');
  });
});

describe('categoryLabel', () => {
  it('maps known categories', () => {
    expect(categoryLabel(0)).toBe('Game');
    expect(categoryLabel(7)).toBe('Productivity');
  });

  it('falls back for unknown categories', () => {
    expect(categoryLabel(99)).toBe('Uncategorized');
  });
});

describe('installerLabel', () => {
  it('names known stores', () => {
    expect(installerLabel('com.android.vending')).toBe('Google Play Store');
    expect(installerLabel('com.sec.android.app.samsungapps')).toBe('Galaxy Store');
  });

  it('marks empty installers as sideloaded', () => {
    expect(installerLabel('')).toBe('Sideloaded');
  });
});

describe('androidVersionFor', () => {
  it('maps API levels to names', () => {
    expect(androidVersionFor(34)).toBe('Android 14');
    expect(androidVersionFor(21)).toBe('Android 5.0');
  });

  it('falls back to the raw API level', () => {
    expect(androidVersionFor(40)).toBe('API 40');
    expect(androidVersionFor(0)).toBe('—');
  });
});
