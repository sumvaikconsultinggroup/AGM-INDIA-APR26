import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

interface Props {
  title: string;
  value: number | string;
  color?: string;
  onPress?: () => void;
}

export function StatsCard({ title, value, color = colors.primary.saffron, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.card, { borderTopColor: color }]} onPress={onPress} disabled={!onPress}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: colors.gold.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
    margin: spacing.xs,
  },
  value: { fontSize: 28, fontWeight: '700' },
  title: { fontSize: 13, color: colors.text.secondary, marginTop: spacing.xs },
});
