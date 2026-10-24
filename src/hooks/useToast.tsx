import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';

export function useToast() {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const visible = useSharedValue(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string) => {
    setMessage(text);
    visible.value = 1;
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      visible.value = withTiming(0, { duration: 200 });
    }, 1800);
  }, [visible]);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visible.value,
    transform: [{ translateY: (1 - visible.value) * 16 }],
  }));

  const node = message ? (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        { backgroundColor: tokens.inverseSurface, bottom: insets.bottom + 32 },
        animatedStyle,
      ]}
    >
      <Text style={[styles.text, { color: tokens.inverseOnSurface }]}>{message}</Text>
    </Animated.View>
  ) : null;

  return { node, show };
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});
