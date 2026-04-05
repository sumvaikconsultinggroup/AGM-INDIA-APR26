import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../theme';
import { useTranslation } from 'react-i18next';

export function ProfileLoginPrompt({ navigation }: any) {
  const { t } = useTranslation();

  const benefits = [
    t('profileLogin.benefits.savedTeachings'),
    t('profileLogin.benefits.registerEvents'),
    t('profileLogin.benefits.trackContributions'),
    t('profileLogin.benefits.personalizedNotifications'),
  ];

  return (
    <View style={styles.container}>
      {/* Decorative Header */}
      <View style={styles.header}>
        <Text style={styles.omSymbol}>ॐ</Text>
        <View style={styles.decorativeLine} />
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        <Text style={styles.title}>{t('profileLogin.title')}</Text>
        <Text style={styles.subtitle}>
          {t('profileLogin.subtitle')}
        </Text>

        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => (
            <View key={benefit} style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>{['🙏', '📅', '💝', '🔔'][index]}</Text>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('Login')}
          buttonColor={colors.primary.saffron}
          textColor={colors.text.white}
          style={styles.signInButton}
          contentStyle={styles.buttonContent}
          icon="login"
        >
          {t('auth.signIn')}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Register')}
          textColor={colors.primary.maroon}
          style={styles.registerButton}
          contentStyle={styles.buttonContent}
          icon="account-plus"
        >
          {t('auth.createAccount')}
        </Button>
      </View>

      {/* Footer Quote */}
      <View style={styles.footer}>
        <Text style={styles.quote}>
          {t('profileLogin.quote')}
        </Text>
        <Text style={styles.quoteAuthor}>{t('profileLogin.quoteAuthor')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  omSymbol: {
    fontSize: 48,
    color: colors.gold.main,
    marginBottom: spacing.md,
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: colors.gold.main,
    borderRadius: 2,
  },
  contentCard: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    shadowColor: colors.gold.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.maroon,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  benefitsContainer: {
    marginBottom: spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.cream,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  benefitText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  signInButton: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  registerButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.primary.maroon,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  quote: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  quoteAuthor: {
    fontSize: 12,
    color: colors.gold.main,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});
