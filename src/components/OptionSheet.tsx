import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface SheetOption {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  checked?: boolean;
}

export function OptionSheet({
  visible,
  title,
  options,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: SheetOption[];
  onSelect: (key: string) => void;
  onClose: () => void;
}) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();

  const handleSelect = (key: string) => {
    Haptics.selectionAsync().catch(() => {});
    onSelect(key);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}}>
          {visible ? (
            <Animated.View
              entering={FadeInDown.springify().damping(20).stiffness(280)}
              exiting={FadeOut.duration(150)}
              style={[
                styles.sheet,
                {
                  backgroundColor: tokens.surfaceContainerLow,
                  paddingBottom: insets.bottom + 16,
                },
              ]}
            >
              <View style={[styles.handle, { backgroundColor: tokens.outlineVariant }]} />
              <Text style={[styles.title, { color: tokens.onSurface }]}>{title}</Text>
              {options.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => handleSelect(option.key)}
                  style={[
                    styles.option,
                    option.checked && { backgroundColor: tokens.secondaryContainer },
                  ]}
                  android_ripple={{ color: tokens.outlineVariant }}
                >
                  {option.icon ? (
                    <Ionicons
                      name={option.icon}
                      size={21}
                      style={[styles.optionIcon, { color: option.checked ? tokens.onSecondaryContainer : tokens.onSurfaceVariant }]}
                    />
                  ) : null}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.optionLabel,
                      {
                        color: option.checked
                          ? tokens.onSecondaryContainer
                          : tokens.onSurface,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.checked ? (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      style={{ color: tokens.onSecondaryContainer }}
                    />
                  ) : null}
                </Pressable>
              ))}
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
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
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
});
