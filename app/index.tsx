import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, Image, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeAppInfo } from 'installed-apps';
import { AppRow, AppTile, SectionHeader } from '@/src/components/AppRow';
import { FastScroller } from '@/src/components/FastScroller';
import { OptionSheet, type SheetOption } from '@/src/components/OptionSheet';
import { ThemeSheet } from '@/src/components/ThemeSheet';
import { SkeletonRows } from '@/src/components/Skeleton';
import { useToast } from '@/src/hooks/useToast';
import { usePersistedState } from '@/src/hooks/usePersistedState';
import { useApps } from '@/src/store/apps';
import { useTheme } from '@/src/theme/ThemeProvider';
import { copyExport, shareExport, type ExportFormat } from '@/src/utils/export';
import { formatBytes, letterFor } from '@/src/utils/format';

type FilterKey = 'all' | 'favorites' | 'user' | 'system' | 'play' | 'sideloaded';
type ViewKey = 'list' | 'grid';
type SortKey = 'name-asc' | 'name-desc' | 'installed-new' | 'installed-old' | 'updated-new' | 'size-desc';
type SheetKind = 'sort' | 'export' | 'theme' | null;

type ListItem =
  | { kind: 'header'; key: string; letter: string; tint?: boolean }
  | { kind: 'app'; key: string; app: NativeAppInfo };

const APP_LOGO = require('../assets/images/android-icon-foreground.png');

const SORT_OPTIONS: { key: SortKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'name-asc', label: 'Name · A to Z', icon: 'text' },
  { key: 'name-desc', label: 'Name · Z to A', icon: 'text' },
  { key: 'installed-new', label: 'Newest installs', icon: 'calendar-outline' },
  { key: 'installed-old', label: 'Oldest installs', icon: 'calendar-outline' },
  { key: 'updated-new', label: 'Recently updated', icon: 'time-outline' },
  { key: 'size-desc', label: 'Largest APK', icon: 'save-outline' },
];

const EXPORT_OPTIONS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'share:text', label: 'Share as text', icon: 'share-social-outline' },
  { key: 'copy:text', label: 'Copy as text', icon: 'copy-outline' },
  { key: 'share:csv', label: 'Share as CSV', icon: 'share-social-outline' },
  { key: 'copy:csv', label: 'Copy as CSV', icon: 'copy-outline' },
  { key: 'share:json', label: 'Share as JSON', icon: 'share-social-outline' },
  { key: 'copy:json', label: 'Copy as JSON', icon: 'copy-outline' },
];

const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: '★' },
  { key: 'user', label: 'User' },
  { key: 'system', label: 'System' },
  { key: 'play', label: 'Play Store' },
  { key: 'sideloaded', label: 'Sideloaded' },
];

const PLAY_INSTALLERS = new Set([
  'com.android.vending',
  'com.sec.android.app.samsungapps',
  'com.amazon.venezia',
]);

export default function IndexScreen() {
  const { tokens } = useTheme();
  const { apps, status, progress, error, rescan } = useApps();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const router = useRouter();
  const { node: toastNode, show } = useToast();
  const listRef = useRef<FlashListRef<ListItem> | null>(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = usePersistedState<FilterKey>('app-lister.filter', 'all');
  const [sort, setSort] = usePersistedState<SortKey>('app-lister.sort', 'name-asc');
  const [view, setView] = usePersistedState<ViewKey>('app-lister.view', 'list');
  const [favorites, setFavorites] = usePersistedState<string[]>('app-lister.favorites', []);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [selection, setSelection] = useState<string[] | null>(null);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const toggleFavorite = useCallback(
    (app: NativeAppInfo) => {
      setFavorites(
        favoriteSet.has(app.packageName)
          ? favorites.filter((p) => p !== app.packageName)
          : [...favorites, app.packageName],
      );
    },
    [favorites, favoriteSet, setFavorites],
  );

  const toggleSelect = useCallback((app: NativeAppInfo) => {
    setSelection((prev) => {
      const base = prev ?? [];
      return base.includes(app.packageName)
        ? base.filter((p) => p !== app.packageName)
        : [...base, app.packageName];
    });
  }, []);

  const enterSelection = useCallback((app: NativeAppInfo) => {
    setSelection([app.packageName]);
  }, []);

  const exitSelection = useCallback(() => setSelection(null), []);

  const userCount = useMemo(() => apps.filter((a) => !a.isSystem).length, [apps]);
  const totalSize = useMemo(() => apps.reduce((sum, a) => sum + a.apkSizeBytes, 0), [apps]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return apps.filter((app) => {
      if (filter === 'favorites' && !favoriteSet.has(app.packageName)) return false;
      if (filter === 'user' && app.isSystem) return false;
      if (filter === 'system' && !app.isSystem) return false;
      if (filter === 'play' && !PLAY_INSTALLERS.has(app.installer)) return false;
      if (filter === 'sideloaded' && PLAY_INSTALLERS.has(app.installer)) return false;
      if (
        query &&
        !app.appName.toLowerCase().includes(query) &&
        !app.packageName.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [apps, filter, search, favoriteSet]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case 'name-desc':
        list.sort((a, b) => b.appName.localeCompare(a.appName));
        break;
      case 'installed-new':
        list.sort((a, b) => b.installTime - a.installTime);
        break;
      case 'installed-old':
        list.sort((a, b) => a.installTime - b.installTime);
        break;
      case 'updated-new':
        list.sort((a, b) => b.updateTime - a.updateTime);
        break;
      case 'size-desc':
        list.sort((a, b) => b.apkSizeBytes - a.apkSizeBytes);
        break;
      default:
        list.sort((a, b) => a.appName.localeCompare(b.appName));
    }
    return list;
  }, [filtered, sort]);

  const grouped = sort === 'name-asc' || sort === 'name-desc';

  const listData = useMemo<ListItem[]>(() => {
    if (view === 'grid' || !grouped) {
      return sorted.map((app) => ({ kind: 'app', key: app.packageName, app }));
    }
    const items: ListItem[] = [];
    let lastLetter = '';
    for (const app of sorted) {
      const letter = letterFor(app.appName);
      if (letter !== lastLetter) {
        lastLetter = letter;
        items.push({ kind: 'header', key: `header-${letter}`, letter });
      }
      items.push({ kind: 'app', key: app.packageName, app });
    }
    return items;
  }, [sorted, view, grouped]);

  const railLetters = useMemo(() => {
    const set = new Set<string>();
    for (const item of listData) {
      if (item.kind === 'header') set.add(item.letter);
    }
    return set;
  }, [listData]);

  const scrollToLetter = useCallback(
    (letter: string) => {
      const flat = listRef.current;
      if (!flat) return;
      const idx = listData.findIndex((item) => item.kind === 'header' && item.letter === letter);
      if (idx < 0) return;
      flat.scrollToIndex({ index: idx, animated: false });
    },
    [listData],
  );

  const openApp = useCallback(
    (app: NativeAppInfo) => {
      if (selection !== null) {
        toggleSelect(app);
        return;
      }
      router.push({ pathname: '/pkg', params: { pkg: app.packageName } });
    },
    [router, selection, toggleSelect],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.kind === 'header') {
        return <SectionHeader letter={item.letter} tint={filter === 'favorites'} />;
      }
      if (view === 'grid') {
        return (
          <AppTile
            app={item.app}
            width={(windowWidth - 40) / 4}
            onPress={openApp}
            favorite={favoriteSet.has(item.app.packageName)}
            onToggleFavorite={toggleFavorite}
          />
        );
      }
      return (
        <AppRow
          app={item.app}
          onPress={openApp}
          onLongPress={enterSelection}
          favorite={favoriteSet.has(item.app.packageName)}
          onToggleFavorite={toggleFavorite}
          selecting={selection !== null}
          selected={selection?.includes(item.app.packageName) ?? false}
          onToggleSelect={toggleSelect}
        />
      );
    },
    [view, openApp, windowWidth, favoriteSet, toggleFavorite, selection, toggleSelect, enterSelection, filter],
  );

  const handleExport = useCallback(
    async (key: string) => {
      const [action, format] = key.split(':') as ['share' | 'copy', ExportFormat];
      try {
        if (action === 'copy') {
          await copyExport(format, apps);
          show('List copied to clipboard');
        } else {
          await shareExport(format, apps);
        }
      } catch {
        show('Export failed');
      }
    },
    [apps, show],
  );

  const handleBatch = useCallback(
    async (key: string) => {
      const [action, format] = key.split(':') as ['share' | 'copy', ExportFormat];
      const selectedApps = apps.filter((a) => selection?.includes(a.packageName) ?? false);
      try {
        if (action === 'copy') {
          await copyExport(format, selectedApps);
          show(`${selectedApps.length} apps copied`);
        } else {
          await shareExport(format, selectedApps);
        }
        exitSelection();
      } catch {
        show('Export failed');
      }
    },
    [apps, selection, show, exitSelection],
  );

  const sheetOptions: SheetOption[] = useMemo(() => {
    if (sheet === 'sort') {
      return SORT_OPTIONS.map((o) => ({ ...o, checked: o.key === sort }));
    }
    return EXPORT_OPTIONS;
  }, [sheet, sort]);

  const scanning = status === 'loading';
  const selectedCount = selection?.length ?? 0;

  return (
    <View style={[styles.root, { backgroundColor: tokens.surface, paddingTop: insets.top }]}>
      <Animated.View entering={FadeInDown.duration(220)} style={styles.header}>
        {selection !== null ? (
          <View style={styles.selectionBar}>
            <Pressable
              onPress={exitSelection}
              hitSlop={8}
              accessibilityLabel="Exit selection"
              style={[styles.roundIconButton, { backgroundColor: tokens.surfaceContainerHigh }]}
            >
              <Ionicons name="close" size={21} color={tokens.onSurface} />
            </Pressable>
            <View style={styles.titleBlock}>
              <Text style={[styles.title, { color: tokens.onSurface }]}>Select apps</Text>
              <Text style={[styles.subtitle, { color: tokens.onSurfaceVariant }]}>
                {selectedCount} selected
              </Text>
            </View>
            <RoundIconButton
              icon="copy-outline"
              onPress={() => setSheet('export')}
              accessibilityLabel="Export selection"
            />
          </View>
        ) : (
          <View style={styles.titleRow}>
            <View style={[styles.logoFrame, { backgroundColor: tokens.primary }]}>
              <Image source={APP_LOGO} style={styles.logo} resizeMode="contain" />
            </View>
            <View style={styles.titleBlock}>
              <Text style={[styles.title, { color: tokens.onSurface }]}>All apps</Text>
              <Text style={[styles.subtitle, { color: tokens.onSurfaceVariant }]}>
                {scanning
                  ? progress
                    ? `Scanning apps · ${progress.total ? `${progress.loaded}/${progress.total}` : progress.loaded}`
                    : 'Scanning apps…'
                  : `${apps.length} apps · ${formatBytes(totalSize)} of APKs`}
              </Text>
            </View>
            <RoundIconButton
              icon="color-palette-outline"
              onPress={() => setSheet('theme')}
              accessibilityLabel="Theme"
            />
            <RoundIconButton
              icon="share-social-outline"
              onPress={() => setSheet('export')}
              accessibilityLabel="Export list"
            />
          </View>
        )}

        {selection === null ? (
          <>
            <View style={styles.statsRow}>
              <StatCard label="Total apps" value={String(apps.length)} bg={tokens.primaryContainer} fg={tokens.onPrimaryContainer} />
              <StatCard label="User" value={String(userCount)} bg={tokens.secondaryContainer} fg={tokens.onSecondaryContainer} />
              <StatCard
                label="System"
                value={String(apps.length - userCount)}
                bg={tokens.tertiaryContainer}
                fg={tokens.onTertiaryContainer}
              />
              <StatCard label="APK size" value={formatBytes(totalSize)} bg={tokens.secondaryContainer} fg={tokens.onSecondaryContainer} />
            </View>

            <View style={[styles.searchPill, { backgroundColor: tokens.surfaceContainerHigh }]}>
              <Ionicons name="search" size={20} color={tokens.onSurfaceVariant} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search apps or packages"
                placeholderTextColor={tokens.onSurfaceVariant}
                style={[styles.searchInput, { color: tokens.onSurface }]}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {search ? (
                <Pressable onPress={() => setSearch('')} hitSlop={8} accessibilityLabel="Clear search">
                  <Ionicons name="close-circle" size={18} color={tokens.onSurfaceVariant} />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.chipsRow}>
              {FILTER_CHIPS.map((chip) => (
                <Chip
                  key={chip.key}
                  label={chip.label}
                  selected={filter === chip.key}
                  onPress={() => setFilter(chip.key)}
                  tokens={tokens}
                />
              ))}
              <View style={styles.chipsSpacer} />
              <Pressable
                onPress={() => setSheet('sort')}
                style={[styles.smallButton, { backgroundColor: tokens.surfaceContainerHigh }]}
                accessibilityLabel="Sort"
              >
                <Ionicons name="swap-vertical" size={16} color={tokens.onSurfaceVariant} />
                <Text style={[styles.smallButtonText, { color: tokens.onSurfaceVariant }]}>
                  {SORT_OPTIONS.find((o) => o.key === sort)?.label}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setView(view === 'list' ? 'grid' : 'list')}
                style={[styles.smallButtonIcon, { backgroundColor: tokens.surfaceContainerHigh }]}
                accessibilityLabel="Toggle view"
              >
                <Ionicons
                  name={view === 'list' ? 'grid-outline' : 'list-outline'}
                  size={17}
                  color={tokens.onSurfaceVariant}
                />
              </Pressable>
            </View>
          </>
        ) : (
          <View style={[styles.hint, { backgroundColor: tokens.surfaceContainerLow }]}>
            <Ionicons name="hand-left-outline" size={15} color={tokens.onSurfaceVariant} />
            <Text style={[styles.hintText, { color: tokens.onSurfaceVariant }]}>
              Tap apps to select · long-press to start again
            </Text>
          </View>
        )}
      </Animated.View>

      {status === 'error' ? (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={48} color={tokens.onSurfaceVariant} />
          <Text style={[styles.stateTitle, { color: tokens.onSurface }]}>Couldn’t scan apps</Text>
          <Text style={[styles.stateBody, { color: tokens.onSurfaceVariant }]}>{error}</Text>
          <Pressable
            onPress={rescan}
            style={[styles.retryButton, { backgroundColor: tokens.primary }]}
          >
            <Text style={[styles.retryText, { color: tokens.onPrimary }]}>Try again</Text>
          </Pressable>
        </View>
      ) : scanning && apps.length === 0 ? (
        <View style={styles.skeletonWrap}>
          <SkeletonRows />
        </View>
      ) : (
        <View style={styles.listWrap}>
          <FlashList
            ref={listRef}
            key={view}
            data={listData}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            numColumns={view === 'grid' ? 4 : 1}
            contentContainerStyle={
              view === 'grid' ? styles.gridContent : styles.listContent
            }
            onRefresh={rescan}
            refreshing={scanning && apps.length > 0}
            ListEmptyComponent={
              <View style={styles.centerState}>
                <Ionicons name="search-outline" size={48} color={tokens.onSurfaceVariant} />
                <Text style={[styles.stateTitle, { color: tokens.onSurface }]}>
                  {filter === 'favorites' && !search ? 'No favorites yet' : 'No apps found'}
                </Text>
                <Text style={[styles.stateBody, { color: tokens.onSurfaceVariant }]}>
                  {filter === 'favorites' && !search
                    ? 'Tap the star on any app to pin it here.'
                    : `Nothing matches “${search.trim()}”. Try another name or package.`}
                </Text>
              </View>
            }
          />
          {view === 'list' && grouped && status === 'ready' ? (
            <FastScroller availableLetters={railLetters} onLetter={scrollToLetter} />
          ) : null}
        </View>
      )}

      <OptionSheet
        visible={sheet === 'sort' || sheet === 'export'}
        title={sheet === 'sort' ? 'Sort by' : selection !== null ? 'Export selection' : 'Export app list'}
        options={sheetOptions}
        onSelect={(key) => {
          if (sheet === 'sort') setSort(key as SortKey);
          else if (selection !== null) handleBatch(key);
          else handleExport(key);
        }}
        onClose={() => setSheet(null)}
      />
      <ThemeSheet visible={sheet === 'theme'} onClose={() => setSheet(null)} />
      {toastNode}
    </View>
  );
}

function StatCard({
  label,
  value,
  bg,
  fg,
}: {
  label: string;
  value: string;
  bg: string;
  fg: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color: fg }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: fg }]}>{label}</Text>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
  tokens,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  tokens: ReturnType<typeof useTheme>['tokens'];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? tokens.secondaryContainer : 'transparent',
          borderColor: selected ? 'transparent' : tokens.outline,
        },
      ]}
    >
      {selected ? (
        <Ionicons name="checkmark" size={15} color={tokens.onSecondaryContainer} />
      ) : null}
      <Text
        style={[
          styles.chipLabel,
          { color: selected ? tokens.onSecondaryContainer : tokens.onSurfaceVariant },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RoundIconButton({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const { tokens } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={[styles.roundIconButton, { backgroundColor: tokens.surfaceContainerHigh }]}
      android_ripple={{ color: tokens.outlineVariant, radius: 22, borderless: true }}
    >
      <Ionicons name={icon} size={21} color={tokens.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoFrame: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 34,
    height: 34,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '44%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 1,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    opacity: 0.85,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    borderRadius: 999,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  chipsSpacer: {
    flex: 1,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hintText: {
    fontSize: 13,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
  },
  chipLabel: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    maxWidth: 190,
  },
  smallButtonText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  smallButtonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 999,
  },
  roundIconButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  skeletonWrap: {
    flex: 1,
    paddingTop: 8,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 32,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  stateBody: {
    fontSize: 13.5,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontSize: 14.5,
    fontWeight: '600',
  },
});
