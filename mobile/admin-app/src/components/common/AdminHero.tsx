import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { borderRadius, colors, shadows, spacing, typography } from '../../theme';

interface HeroAction {
  label: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Icon>['name'];
}

interface AdminHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  style?: StyleProp<ViewStyle>;
  actions?: HeroAction[];
}

export function AdminHero({ eyebrow, title, subtitle, badge, style, actions }: AdminHeroProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <View style={styles.copyBlock}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {actions?.length ? (
        <View style={styles.actionRow}>
          {actions.map((action) => (
            <TouchableOpacity key={action.label} style={styles.actionChip} onPress={action.onPress}>
              {action.icon ? (
                <Icon name={action.icon} size={16} color={colors.text.white} style={styles.actionIcon} />
              ) : null}
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    backgroundColor: colors.primary.maroon,
    ...shadows.raised,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copyBlock: {
    flex: 1,
  },
  eyebrow: {
    ...typography.micro,
    color: colors.gold.light,
    letterSpacing: 1.1,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.hero,
    color: colors.text.white,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.82)',
    marginTop: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.micro,
    color: colors.gold.light,
    letterSpacing: 0.8,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.saffron,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionIcon: {
    marginRight: spacing.xs,
  },
  actionText: {
    ...typography.label,
    color: colors.text.white,
  },
});
