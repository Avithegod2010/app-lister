import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import native from 'installed-apps';
import { AppIcon } from '@/src/components/AppIcon';
import { useToast } from '@/src/hooks/useToast';
import { useApps } from '@/src/store/apps';
import { useTheme } from '@/src/theme/ThemeProvider';
import { androidVersionFor } from '@/src/utils/androidVersions';
import { formatBytes, formatDate } from '@/src/utils/format';

export default function AppDetailsScreen() {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { pkg } = useLocalSearchParams<{ pkg: string }>();
  const { getApp } = useApps();
  const { node: toastNode, show } = useToast();

  const packageName = Array.isArray(pkg) ? pkg[0] : pkg ?? '';
  const app = getApp(packageName);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  const copyPackage = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(packageName);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      show('Package name copied');
    } catch {
      show('Copy failed');
    }
  }, [packageName, show]);

  const launch = useCallback(() => {
    try {
      const ok = native.launchApp(packageName);
      if (!ok) show('This app has no launcher');
    } catch {
      show('Couldn’t launch the app');
    }
  }, [packageName, show]);

  const openInfo = useCallback(() => {
    try {
      native.openAppInfo(packageName);
    } catch {
      show('Couldn’t open App Info');
    }
  }, [packageName, show]);

  if (!app) {
    return (
      <View style={[styles.root, { backgroundColor: tokens.surface, paddingTop: insets.top }]}>
        <BackButton onPress={goBack} />
        <View style={styles.centerState}>
          <Ionicons name="apps-outline" size={48} color={tokens.onSurfaceVariant} />
          <Text style={[styles.stateTitle, { color: tokens.onSurface }]}>App not found</Text>
          <Text style={[styles.stateBody, { color: tokens.onSurfaceVariant }]}>
            It may have been uninstalled since the last scan.
          </Text>
        </View>
        {toastNode}
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: tokens.surface }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 48 }]}>
        <BackButton onPress={goBack} />

        <Animated.View entering={FadeInDown.duration(380)} style={styles.hero}>
          <AppIcon app={app} size={96} />
          <Text style={[styles.appName, { color: tokens.onSurface }]}>{app.appName}</Text>
          <View style={styles.heroChips}>
            <View style={[styles.heroChip, { backgroundColor: tokens.secondaryContainer }]}>
              <Text style={[styles.heroChipText, { color: tokens.onSecondaryContainer }]}>
                v{app.versionName}
              </Text>
            </View>
            {app.isSystem ? (
              <View style={[styles.heroChip, { backgroundColor: tokens.tertiaryContainer }]}>
                <Text style={[styles.heroChipText, { color: tokens.onTertiaryContainer }]}>
                  System app
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={launch}
              style={[styles.launchButton, { backgroundColor: tokens.primary }]}
              android_ripple={{ color: tokens.onPrimary, foreground: true, radius: 200 }}
            >
              <Ionicons name="open-outline" size={18} color={tokens.onPrimary} />
              <Text style={[styles.launchText, { color: tokens.onPrimary }]}>Launch</Text>
            </Pressable>
            <Pressable
              onPress={openInfo}
              style={[styles.infoButton, { backgroundColor: tokens.surfaceContainerHigh }]}
              android_ripple={{ color: tokens.outlineVariant, foreground: true, radius: 200 }}
            >
              <Ionicons name="settings-outline" size={18} color={tokens.onSurface} />
              <Text style={[styles.infoText, { color: tokens.onSurface }]}>App info</Text>
            </Pressable>
            <Pressable
              onPress={copyPackage}
              accessibilityLabel="Copy package name"
              style={[styles.copyButton, { backgroundColor: tokens.surfaceContainerHigh }]}
              android_ripple={{ color: tokens.outlineVariant, borderless: true, radius: 26 }}
            >
              <Ionicons name="copy-outline" size={19} color={tokens.onSurface} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(90).duration(360)}
          style={[styles.infoCard, { backgroundColor: tokens.surfaceContainerLow }]}
        >
          <InfoRow label="Package name" value={app.packageName} mono onCopy={copyPackage} />
          <InfoRow label="Version" value={app.versionName} />
          <InfoRow label="Version code" value={app.versionCode ? String(app.versionCode) : '—'} />
          <InfoRow label="Minimum OS" value={androidVersionFor(app.minSdk)} />
          <InfoRow label="Target OS" value={androidVersionFor(app.targetSdk)} />
          <InfoRow label="Installed" value={formatDate(app.installTime)} />
          <InfoRow label="Updated" value={formatDate(app.updateTime)} />
          <InfoRow label="APK size" value={formatBytes(app.apkSizeBytes)} />
          <InfoRow label="APK path" value={app.apkPath || '—'} mono small last />
        </Animated.View>
      </ScrollView>
      {toastNode}
    </View>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  const { tokens } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Back"
      style={[styles.backButton, { backgroundColor: tokens.surfaceContainerHigh }]}
      android_ripple={{ color: tokens.outlineVariant, borderless: true, radius: 24 }}
    >
      <Ionicons name="arrow-back" size={21} color={tokens.onSurface} />
    </Pressable>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
  small = false,
  last = false,
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
  last?: boolean;
  onCopy?: () => void;
}) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: tokens.outlineVariant }]}>
      <Text style={[styles.infoLabel, { color: tokens.onSurfaceVariant }]}>{label}</Text>
      <View style={styles.infoValueBlock}>
        <Text
          selectable
          numberOfLines={2}
          style={[
            styles.infoValue,
            { color: tokens.onSurface },
            mono && styles.mono,
            small && styles.smallValue,
          ]}
        >
          {value}
        </Text>
        {onCopy ? (
          <Pressable onPress={onCopy} hitSlop={6} accessibilityLabel={`Copy ${label}`}>
            <Ionicons name="copy-outline" size={16} color={tokens.onSurfaceVariant} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  heroChips: {
    flexDirection: 'row',
    gap: 8,
  },
  heroChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroChipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 26,
  },
  launchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 999,
    paddingHorizontal: 26,
  },
  launchText: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 999,
    paddingHorizontal: 18,
  },
  infoText: {
    fontSize: 14.5,
    fontWeight: '500',
  },
  copyButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    borderRadius: 24,
    paddingHorizontal: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 13,
  },
  infoLabel: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  infoValueBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    justifyContent: 'flex-end',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  smallValue: {
    fontSize: 11.5,
  },
  mono: {
    fontFamily: 'monospace',
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
});
