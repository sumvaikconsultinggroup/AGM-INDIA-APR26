import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../theme';

interface AdminEmptyStateProps {
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AdminEmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: AdminEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={30} color={colors.primary.saffron} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: `${colors.primary.saffron}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.primary.maroon,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary.saffron,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    ...typography.label,
    color: colors.text.white,
  },
});
