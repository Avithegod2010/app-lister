/** Pure export-content builders, safe to run under Jest without RN. */
import type { NativeAppInfo } from 'installed-apps';
import { buildContent, buildCsv, buildText, csvCell } from '../src/utils/exportContent';

const app = (over: Partial<NativeAppInfo> = {}): NativeAppInfo => ({
  appName: 'Calculator',
  packageName: 'com.android.calculator',
  versionName: '1.0',
  versionCode: 1,
  installTime: 1700000000000,
  updateTime: 1700100000000,
  isSystem: false,
  minSdk: 24,
  targetSdk: 34,
  category: 0,
  apkPath: '/system/app/Calc.apk',
  apkSizeBytes: 2048,
  iconPath: '/cache/icon.png',
  installer: 'com.android.vending',
  hasLauncher: true,
  ...over,
});

describe('csvCell', () => {
  it('passes through plain values', () => {
    expect(csvCell('hello')).toBe('hello');
    expect(csvCell(42)).toBe('42');
    expect(csvCell(true)).toBe('true');
  });

  it('quotes values containing commas, quotes or newlines', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('line\nbreak')).toBe('"line\nbreak"');
  });
});

describe('buildText', () => {
  it('includes the app name, package and system marker', () => {
    const text = buildText([app(), app({ appName: 'Settings', packageName: 'com.android.settings', isSystem: true })]);
    expect(text).toContain('1. Calculator (com.android.calculator) — v1.0');
    expect(text).toContain('2. Settings (com.android.settings) — v1.0 [system]');
    expect(text).toContain('2 apps · 1 user · 1 system');
  });

  it('handles an empty list', () => {
    expect(buildText([])).toContain('0 apps · 0 user · 0 system');
  });
});

describe('buildCsv', () => {
  it('escapes commas in names', () => {
    const csv = buildCsv([app({ appName: 'A, B' })]);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('name,package,version,is_system,installed,updated,apk_size_bytes');
    expect(lines[1]).toContain('"A, B",com.android.calculator,1.0,false');
  });

  it('serialises ISO dates', () => {
    const csv = buildCsv([app()]);
    expect(csv).toContain('2023-11-14T22:13:20.000Z');
  });
});

describe('buildContent', () => {
  it('routes to the right builder', () => {
    const apps = [app()];
    expect(buildContent('text', apps)).toBe(buildText(apps));
    expect(buildContent('csv', apps)).toBe(buildCsv(apps));
    expect(buildContent('json', apps)).toContain('"packageName": "com.android.calculator"');
  });

  it('json keeps numeric apk size for machines', () => {
    const json = JSON.parse(buildContent('json', [app()]));
    expect(json[0].apkSizeBytes).toBe(2048);
    expect(json[0].name).toBe('Calculator');
  });
});
