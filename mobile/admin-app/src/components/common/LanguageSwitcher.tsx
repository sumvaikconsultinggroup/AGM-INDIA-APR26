import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme';
import { useI18n } from '../../i18n/I18nProvider';

export function LanguageSwitcher() {
  const { language, setLanguage, languageOptions, t } = useI18n();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('common.language')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
        {languageOptions.map((option) => {
          const active = option.code === language;
          return (
            <TouchableOpacity
              key={option.code}
              style={[styles.chip, active && styles.activeChip]}
              onPress={() => setLanguage(option.code)}
              accessibilityRole="button"
              accessibilityLabel={`${t('common.language')}: ${option.label}`}
            >
              <Text style={[styles.chipText, active && styles.activeChipText]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.warmWhite,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  options: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background.sandstone,
  },
  activeChip: {
    backgroundColor: colors.primary.saffron,
  },
  chipText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '600',
  },
  activeChipText: {
    color: colors.text.white,
  },
});
