import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { useTranslation } from 'react-i18next';

export function PlaceholderScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🙏 {t('common.comingSoon')}</Text>
      <Text style={styles.subtitle}>{t('home.welcome')}</Text>
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
