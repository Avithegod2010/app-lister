import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';

function Shimmer({ index, children }: { index: number; children?: React.ReactNode }) {
  const { tokens } = useTheme();
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withDelay(
      index * 90,
      withRepeat(withTiming(1, { duration: 650 }), -1, true),
    );
    return () => {
      cancelAnimation(opacity);
    };
  }, [index, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: tokens.surfaceContainerHigh }]} />
      <View style={styles.lines}>
        {children ??
          [styles.lineWide, styles.lineNarrow].map((style, i) => (
            <Animated.View
              key={i}
              style={[
                style,
                { backgroundColor: tokens.surfaceContainerHigh },
                animatedStyle,
              ]}
            />
          ))}
      </View>
    </View>
  );
}

export function SkeletonRows({ count = 10 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => (
        <Shimmer key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 11,
  },
  lines: {
    flex: 1,
    gap: 8,
  },
  lineWide: {
    height: 13,
    borderRadius: 6,
    width: '62%',
  },
  lineNarrow: {
    height: 11,
    borderRadius: 6,
    width: '84%',
  },
});
