import React from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ACCENT_PRESETS, type ThemeMode } from '@/src/theme/tokens';

const MODES: { key: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'system', label: 'Follow system', icon: 'phone-portrait-outline' },
  { key: 'light', label: 'Light', icon: 'sunny-outline' },
  { key: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export function ThemeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const {
    tokens,
    mode,
    setMode,
    sourceColor,
    setSourceColor,
    useWallpaper,
    setUseWallpaper,
    amoled,
    setAmoled,
  } = useTheme();
  const insets = useSafeAreaInsets();

  const select = (fn: () => void) => {
    Haptics.selectionAsync().catch(() => {});
    fn();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}}>
          {visible ? (
            <Animated.View
              entering={FadeInDown.springify().damping(26).stiffness(300)}
              exiting={FadeOut.duration(120)}
              style={[styles.sheet, { backgroundColor: tokens.surfaceContainerLow, paddingBottom: insets.bottom + 16 }]}
            >
              <View style={[styles.handle, { backgroundColor: tokens.outlineVariant }]} />
              <Text style={[styles.title, { color: tokens.onSurface }]}>Appearance</Text>

              {MODES.map((m) => (
                <Pressable
                  key={m.key}
                  onPress={() => select(() => setMode(m.key))}
                  style={[styles.option, mode === m.key && { backgroundColor: tokens.secondaryContainer }]}
                  android_ripple={{ color: tokens.outlineVariant }}
                >
                  <Ionicons
                    name={m.icon}
                    size={20}
                    style={[styles.optionIcon, { color: mode === m.key ? tokens.onSecondaryContainer : tokens.onSurfaceVariant }]}
                  />
                  <Text
                    style={[styles.optionLabel, { color: mode === m.key ? tokens.onSecondaryContainer : tokens.onSurface }]}
                  >
                    {m.label}
                  </Text>
                  {mode === m.key ? (
                    <Ionicons name="checkmark" size={19} color={tokens.onSecondaryContainer} />
                  ) : null}
                </Pressable>
              ))}

              <Text style={[styles.section, { color: tokens.onSurfaceVariant }]}>ACCENT COLOR</Text>
              <View style={styles.swatchRow}>
                <Pressable
                  onPress={() => select(() => setUseWallpaper(true))}
                  accessibilityLabel="Use wallpaper color"
                  style={[
                    styles.swatch,
                    styles.wallpaperSwatch,
                    { borderColor: tokens.outlineVariant },
                    useWallpaper && { borderWidth: 2, borderColor: tokens.primary },
                  ]}
                >
                  <Ionicons name="color-wand-outline" size={16} color={tokens.primary} />
                  <Text style={[styles.swatchLabel, { color: tokens.onSurfaceVariant }]}>Wallpaper</Text>
                </Pressable>
                {ACCENT_PRESETS.map((preset) => {
                  const selected = !useWallpaper && sourceColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <Pressable
                      key={preset.hex}
                      onPress={() => select(() => setSourceColor(preset.hex))}
                      accessibilityLabel={preset.label}
                      hitSlop={4}
                      style={[
                        styles.swatch,
                        { backgroundColor: preset.hex },
                        selected && { borderWidth: 3, borderColor: tokens.onSurface },
                      ]}
                    >
                      {selected ? <Ionicons name="checkmark" size={15} color="#FFFFFF" /> : null}
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.section, { color: tokens.onSurfaceVariant }]}>DISPLAY</Text>
              <View style={[styles.toggleRow, { borderBottomColor: tokens.outlineVariant }]}>
                <Ionicons name="contrast-outline" size={20} color={tokens.onSurfaceVariant} style={styles.optionIcon} />
                <View style={styles.toggleText}>
                  <Text style={[styles.optionLabel, { color: tokens.onSurface }]}>AMOLED black</Text>
                  <Text style={[styles.toggleHint, { color: tokens.onSurfaceVariant }]}>
                    Pure black surfaces in dark mode
                  </Text>
                </View>
                <Switch
                  value={amoled}
                  onValueChange={(v) => select(() => setAmoled(v))}
                  trackColor={{ false: tokens.outlineVariant, true: tokens.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <Text style={[styles.footnote, { color: tokens.onSurfaceVariant }]}>
                Accent colors are Material You palettes generated from a seed color.
              </Text>
            </Animated.View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  optionIcon: {
    width: 24,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
  },
  section: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallpaperSwatch: {
    width: 52,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  swatchLabel: {
    fontSize: 8,
    fontWeight: '600',
    marginTop: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toggleText: {
    flex: 1,
    gap: 1,
  },
  toggleHint: {
    fontSize: 12,
  },
  footnote: {
    fontSize: 12,
    paddingHorizontal: 16,
    marginTop: 14,
    opacity: 0.8,
  },
});
