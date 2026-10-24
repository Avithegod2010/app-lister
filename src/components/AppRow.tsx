import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { NativeAppInfo } from 'installed-apps';
import { AppIcon } from './AppIcon';
import { useTheme } from '@/src/theme/ThemeProvider';

const SPRING = { damping: 18, stiffness: 260 };
const ENTRANCE_LIMIT = 14;

function usePressScale() {
  const scale = useSharedValue(1);
  const pressIn = () => {
    scale.value = withSpring(0.96, SPRING);
  };
  const pressOut = () => {
    scale.value = withSpring(1, SPRING);
  };
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return { pressIn, pressOut, animatedStyle };
}

export const AppRow = memo(function AppRow({
  app,
  index,
  onPress,
}: {
  app: NativeAppInfo;
  index: number;
  onPress: (app: NativeAppInfo) => void;
}) {
  const { tokens } = useTheme();
  const { pressIn, pressOut, animatedStyle } = usePressScale();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress(app);
  };

  return (
    <Animated.View
      entering={index < ENTRANCE_LIMIT ? FadeInDown.delay(index * 22).duration(280) : undefined}
      style={animatedStyle}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[styles.row, { backgroundColor: tokens.surface }]}
        android_ripple={{ color: tokens.outlineVariant, foreground: true }}
      >
        <AppIcon app={app} size={44} />
        <View style={styles.rowText}>
          <Text numberOfLines={1} style={[styles.name, { color: tokens.onSurface }]}>
            {app.appName}
          </Text>
          <Text numberOfLines={1} style={[styles.sub, { color: tokens.onSurfaceVariant }]}>
            {app.packageName} · v{app.versionName}
          </Text>
        </View>
        {app.isSystem ? (
          <View style={[styles.systemChip, { borderColor: tokens.outlineVariant }]}>
            <Text style={[styles.systemChipText, { color: tokens.onSurfaceVariant }]}>SYSTEM</Text>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
});

export const AppTile = memo(function AppTile({
  app,
  index,
  width,
  onPress,
}: {
  app: NativeAppInfo;
  index: number;
  width: number;
  onPress: (app: NativeAppInfo) => void;
}) {
  const { tokens } = useTheme();
  const { pressIn, pressOut, animatedStyle } = usePressScale();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress(app);
  };

  return (
    <Animated.View
      entering={index < ENTRANCE_LIMIT ? FadeInDown.delay(Math.min(index, 20) * 18).duration(280) : undefined}
      style={[animatedStyle, { width }]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[styles.tile, { backgroundColor: tokens.surface }]}
        android_ripple={{ color: tokens.outlineVariant, foreground: true }}
      >
        <AppIcon app={app} size={52} />
        <Text
          numberOfLines={2}
          style={[styles.tileName, { color: tokens.onSurface }]}
        >
          {app.appName}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

export const SectionHeader = memo(function SectionHeader({ letter }: { letter: string }) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.sectionHeader, { backgroundColor: tokens.surface }]}>
      <Text style={[styles.sectionLetter, { color: tokens.primary }]}>{letter}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15.5,
    fontWeight: '500',
  },
  sub: {
    fontSize: 12.5,
  },
  systemChip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  systemChipText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tile: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 18,
  },
  tileName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionLetter: {
    fontSize: 14,
    fontWeight: '700',
  },
});
