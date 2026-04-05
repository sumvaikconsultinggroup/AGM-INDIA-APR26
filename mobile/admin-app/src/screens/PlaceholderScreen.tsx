import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { useI18n } from '../i18n/I18nProvider';

export function PlaceholderScreen() {
  const { t } = useI18n();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('common.comingSoon')}</Text>
      <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.parchment,
  },
  text: {
    fontSize: 20,
    color: colors.primary.maroon,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
});
