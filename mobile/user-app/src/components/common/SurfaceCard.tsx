import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../theme';

interface SurfaceCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export function SurfaceCard({ children, style, compact = false }: SurfaceCardProps) {
  return <View style={[styles.card, compact && styles.compact, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    padding: spacing.lg,
    ...shadows.warm,
  },
  compact: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
});
