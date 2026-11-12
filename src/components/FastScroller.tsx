import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeOut,
  FadeOutRight,
} from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';

const RAIL_LETTERS = [
  '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

/**
 * A–Z rail pinned to the screen edge. Drag or tap a letter to jump.
 * Slides in while scrolling, slides away when idle; the active letter
 * pops in a bubble beside the rail while dragging.
 */
export function FastScroller({
  availableLetters,
  onLetter,
}: {
  availableLetters: Set<string>;
  onLetter: (letter: string) => void;
}) {
  const { tokens } = useTheme();
  const [active, setActive] = useState<string | null>(null);

  const pick = useCallback(
    (letter: string) => {
      if (!availableLetters.has(letter)) return;
      setActive(letter);
      onLetter(letter);
    },
    [availableLetters, onLetter],
  );

  const clear = useCallback(() => {
    setActive(null);
  }, []);

  return (
    <Animated.View
      entering={FadeInRight.duration(200)}
      exiting={FadeOutRight.duration(220)}
      pointerEvents="box-none"
      style={styles.wrap}
    >
      {active ? (
        <Animated.View
          key={active}
          entering={FadeInDown.springify().damping(18).stiffness(300)}
          exiting={FadeOut.duration(120)}
          style={[styles.bubble, { backgroundColor: tokens.inverseSurface }]}
          pointerEvents="none"
        >
          <Text style={[styles.bubbleText, { color: tokens.inverseOnSurface }]}>{active}</Text>
        </Animated.View>
      ) : null}

      <View
        style={[styles.rail, { backgroundColor: tokens.surfaceContainer }]}
        pointerEvents="auto"
        onTouchEnd={clear}
      >
        {RAIL_LETTERS.map((letter) => {
          const available = availableLetters.has(letter);
          const isActive = active === letter;
          return (
            <Pressable
              key={letter}
              onPress={() => pick(letter)}
              onPressIn={() => pick(letter)}
              disabled={!available}
              style={[
                styles.cell,
                isActive && { backgroundColor: tokens.primary },
              ]}
            >
              <Text
                style={[
                  styles.letter,
                  {
                    color: !available
                      ? tokens.outlineVariant
                      : isActive
                        ? tokens.onPrimary
                        : tokens.onSurfaceVariant,
                  },
                ]}
              >
                {letter}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
  },
  bubble: {
    position: 'absolute',
    right: 34,
    alignSelf: 'center',
    minWidth: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  bubbleText: {
    fontSize: 24,
    fontWeight: '800',
  },
  rail: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginRight: 2,
    alignItems: 'center',
    gap: 0,
  },
  cell: {
    width: 22,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  letter: {
    fontSize: 9.5,
    fontWeight: '700',
  },
});
