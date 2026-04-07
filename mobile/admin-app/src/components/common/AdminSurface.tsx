import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../theme';

interface AdminSurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export function AdminSurface({ children, style, padded = true }: AdminSurfaceProps) {
  return <View style={[styles.surface, padded && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.soft,
  },
  padded: {
    padding: spacing.md,
  },
});
