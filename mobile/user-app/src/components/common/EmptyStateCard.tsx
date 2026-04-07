import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { SurfaceCard } from './SurfaceCard';

interface EmptyStateCardProps {
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  subtitle?: string;
}

export function EmptyStateCard({ icon, title, subtitle }: EmptyStateCardProps) {
  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={26} color={colors.gold.dark} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.primary.maroon,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
