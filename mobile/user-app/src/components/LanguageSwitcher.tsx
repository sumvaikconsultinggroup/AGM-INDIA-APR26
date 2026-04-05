import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'অসমীয়া' },
];

interface LanguageSwitcherProps {
  showHeader?: boolean;
  onLanguageChange?: (languageCode: string) => void;
}

export default function LanguageSwitcher({
  showHeader = true,
  onLanguageChange,
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon name="translate" size={18} color="#B45309" />
            <Text style={styles.title}>{t('profile.language')}</Text>
          </View>
          <Text style={styles.subtitle}>{currentLanguage.toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.grid}>
        {LANGUAGES.map((language) => {
          const active = currentLanguage === language.code;
          return (
            <TouchableOpacity
              key={language.code}
              onPress={() => {
                i18n.changeLanguage(language.code);
                onLanguageChange?.(language.code);
              }}
              style={[styles.option, active && styles.activeOption]}
              accessibilityRole="button"
              accessibilityLabel={t('common.changeLanguageTo', { language: language.label })}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionCode, active && styles.activeCode]}>
                {language.code.toUpperCase()}
              </Text>
              <Text style={[styles.optionText, active && styles.activeText]} numberOfLines={1}>
                {language.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F4D9A5',
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '700',
    color: '#7F1D1D',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  option: {
    width: '33.33%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  activeOption: {
    transform: [{ scale: 1.01 }],
  },
  optionCode: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 3,
  },
  activeCode: {
    color: '#C2410C',
  },
  optionText: {
    backgroundColor: '#FFF7E6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F6D8A8',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#5B3A29',
  },
  activeText: {
    backgroundColor: '#F97316',
    borderColor: '#EA580C',
    color: '#FFFFFF',
  },
});

