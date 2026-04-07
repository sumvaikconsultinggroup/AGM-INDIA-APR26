import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface AdminSectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AdminSectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: AdminSectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copyBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Icon name="arrow-right" size={16} color={colors.primary.saffron} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  copyBlock: {
    flex: 1,
  },
  title: {
    ...typography.titleLg,
    color: colors.primary.maroon,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: 2,
  },
  actionText: {
    ...typography.label,
    color: colors.primary.saffron,
  },
});
