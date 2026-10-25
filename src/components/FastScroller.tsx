import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';

const RAIL_LETTERS = [
  '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

/**
 * A–Z rail pinned to the screen edge. Drag or tap a letter to jump.
 * Only letters present in the list are highlighted; missing ones are dimmed.
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
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      pointerEvents="box-none"
      style={styles.wrap}
    >
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
              hitSlop={0}
              style={[styles.cell, isActive && { backgroundColor: tokens.primary }]}
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
