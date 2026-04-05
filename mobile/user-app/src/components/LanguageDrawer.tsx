import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, borderRadius, spacing, shadows } from '../theme';

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

interface LanguageDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageDrawer({
  visible,
  onClose,
}: LanguageDrawerProps) {
  const { i18n, t } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.drawer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t('profile.language')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
              <Icon name="close" size={20} color={colors.primary.maroon} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          >
            {LANGUAGES.map((language) => {
              const active = currentLanguage === language.code;
              return (
                <TouchableOpacity
                  key={language.code}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => {
                    i18n.changeLanguage(language.code);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.changeLanguageTo', { language: language.label })}
                  activeOpacity={0.85}
                >
                  <View style={styles.optionLeft}>
                    <Text style={[styles.optionCode, active && styles.optionCodeActive]}>
                      {language.code.toUpperCase()}
                    </Text>
                    <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                      {language.label}
                    </Text>
                  </View>
                  {active ? (
                    <Icon name="check-circle" size={20} color={colors.primary.saffron} />
                  ) : (
                    <Icon name="chevron-right" size={18} color={colors.text.secondary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(46, 27, 10, 0.28)',
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    width: '82%',
    maxWidth: 360,
    backgroundColor: '#FFF9EF',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    borderLeftWidth: 1,
    borderColor: '#F1D8AE',
    ...shadows.temple,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF2DC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0D3A2',
  },
  list: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFCF6',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#F3DFC0',
  },
  optionActive: {
    backgroundColor: '#FFF2D7',
    borderColor: '#F2B04B',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  optionCode: {
    width: 44,
    fontSize: 12,
    fontWeight: '800',
    color: colors.gold.dark,
  },
  optionCodeActive: {
    color: colors.primary.saffron,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  optionLabelActive: {
    color: colors.primary.maroon,
  },
});
