import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { NativeAppInfo } from 'installed-apps';
import { AppIcon } from './AppIcon';
import { useTheme } from '@/src/theme/ThemeProvider';

const SPRING = { damping: 22, stiffness: 320 };

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

function haptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export const AppRow = memo(function AppRow({
  app,
  onPress,
  onLongPress,
  favorite,
  onToggleFavorite,
  selecting,
  selected,
  onToggleSelect,
}: {
  app: NativeAppInfo;
  onPress: (app: NativeAppInfo) => void;
  onLongPress?: (app: NativeAppInfo) => void;
  favorite?: boolean;
  onToggleFavorite?: (app: NativeAppInfo) => void;
  selecting?: boolean;
  selected?: boolean;
  onToggleSelect?: (app: NativeAppInfo) => void;
}) {
  const { tokens } = useTheme();
  const { pressIn, pressOut, animatedStyle } = usePressScale();

  const handlePress = () => {
    if (selecting) {
      haptic();
      onToggleSelect?.(app);
      return;
    }
    haptic();
    onPress(app);
  };

  const handleLongPress = () => {
    if (selecting) return;
    haptic();
    if (onToggleSelect) {
      onToggleSelect(app);
    } else {
      onLongPress?.(app);
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onLongPress={onToggleSelect ? handleLongPress : () => onLongPress?.(app)}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[
          styles.row,
          { backgroundColor: selected ? tokens.secondaryContainer : tokens.surface },
        ]}
        android_ripple={{ color: tokens.outlineVariant, foreground: true }}
      >
        {selecting ? (
          <View
            style={[
              styles.checkbox,
              {
                borderColor: selected ? tokens.primary : tokens.outline,
                backgroundColor: selected ? tokens.primary : 'transparent',
              },
            ]}
          >
            {selected ? <Ionicons name="checkmark" size={14} color={tokens.onPrimary} /> : null}
          </View>
        ) : (
          <AppIcon app={app} size={44} />
        )}
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
        {!selecting && onToggleFavorite ? (
          <Pressable
            onPress={() => {
              haptic();
              onToggleFavorite(app);
            }}
            hitSlop={10}
            accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
            style={styles.starButton}
          >
            <Ionicons
              name={favorite ? 'star' : 'star-outline'}
              size={20}
              color={favorite ? tokens.primary : tokens.onSurfaceVariant}
            />
          </Pressable>
        ) : null}
      </Pressable>
    </Animated.View>
  );
});

export const AppTile = memo(function AppTile({
  app,
  width,
  onPress,
  onToggleFavorite,
  favorite,
}: {
  app: NativeAppInfo;
  width: number;
  onPress: (app: NativeAppInfo) => void;
  onToggleFavorite?: (app: NativeAppInfo) => void;
  favorite?: boolean;
}) {
  const { tokens } = useTheme();
  const { pressIn, pressOut, animatedStyle } = usePressScale();

  const handlePress = () => {
    haptic();
    onPress(app);
  };

  return (
    <Animated.View style={[animatedStyle, { width }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[styles.tile, { backgroundColor: tokens.surface }]}
        android_ripple={{ color: tokens.outlineVariant, foreground: true }}
      >
        <View>
          <AppIcon app={app} size={52} />
        </View>
        <Text numberOfLines={2} style={[styles.tileName, { color: tokens.onSurface }]}>
          {app.appName}
        </Text>
        {onToggleFavorite ? (
          <Pressable
            onPress={() => {
              haptic();
              onToggleFavorite(app);
            }}
            hitSlop={6}
            style={styles.tileStar}
            accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Ionicons
              name={favorite ? 'star' : 'star-outline'}
              size={16}
              color={favorite ? tokens.primary : tokens.outline}
            />
          </Pressable>
        ) : null}
      </Pressable>
    </Animated.View>
  );
});

export const SectionHeader = memo(function SectionHeader({
  letter,
  tint,
}: {
  letter: string;
  tint?: boolean;
}) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.sectionHeader, { backgroundColor: tokens.surface }]}>
      <Text
        style={[
          styles.sectionLetter,
          { color: tint ? tokens.primary : tokens.onSurfaceVariant },
        ]}
      >
        {letter}
      </Text>
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
  starButton: {
    padding: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
  tileStar: {
    position: 'absolute',
    top: 6,
    right: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionLetter: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
