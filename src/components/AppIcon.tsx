import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { NativeAppInfo } from 'installed-apps';
import { useTheme, type IconShape } from '@/src/theme/ThemeProvider';

const SHAPE_RADIUS: Record<IconShape, (size: number) => number> = {
  rounded: (size) => size * 0.24,
  circle: (size) => size / 2,
  square: (size) => size * 0.08,
};

export const AppIcon = memo(function AppIcon({
  app,
  size,
}: {
  app: NativeAppInfo;
  size: number;
}) {
  const { tokens, iconShape } = useTheme();

  if (!app.iconPath) {
    return <LetterTile name={app.appName} size={size} />;
  }

  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: SHAPE_RADIUS[iconShape](size),
          backgroundColor: tokens.surfaceContainerHigh,
        },
      ]}
    >
      <Image
        source={{ uri: app.iconPath }}
        style={styles.image}
        contentFit="cover"
        transition={120}
        recyclingKey={app.packageName}
        cachePolicy="memory-disk"
      />
    </View>
  );
});

export const LetterTile = memo(function LetterTile({
  name,
  size,
  shape,
}: {
  name: string;
  size: number;
  shape?: IconShape;
}) {
  const { tokens } = useTheme();
  return (
    <View
      style={[
        styles.frame,
        styles.letterTile,
        {
          width: size,
          height: size,
          borderRadius: SHAPE_RADIUS[shape ?? 'rounded'](size),
          backgroundColor: tokens.primaryContainer,
        },
      ]}
    >
      <Text
        style={{
          color: tokens.onPrimaryContainer,
          fontSize: size * 0.42,
          fontWeight: '600',
        }}
      >
        {name.trim().charAt(0).toUpperCase() || '?'}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterTile: {},
  image: {
    width: '100%',
    height: '100%',
  },
});
