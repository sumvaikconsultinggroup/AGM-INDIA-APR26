import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { registerForPushNotifications } from '../../services/notifications';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors, spacing, shadows } from '../../theme';

const LOGO_SOURCE = require('../../../assets/images/avdheshanandg-mission-logo.jpg');

export function OnboardingNotificationsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { updateState } = useOnboarding();
  const [submitting, setSubmitting] = useState(false);

  const handleEnable = async () => {
    setSubmitting(true);
    try {
      const token = await registerForPushNotifications();
      await updateState({
        notificationsPrompted: true,
        notificationsEnabled: !!token,
      });
    } finally {
      setSubmitting(false);
      navigation.navigate('OnboardingLocation');
    }
  };

  const handleLater = async () => {
    await updateState({
      notificationsPrompted: true,
      notificationsEnabled: false,
    });
    navigation.navigate('OnboardingLocation');
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <Image source={LOGO_SOURCE} style={styles.brandLogo} />
        <Text style={styles.brandText}>{t('onboarding.brand')}</Text>
      </View>
      <View style={styles.spacer} />
      <Text style={styles.eyebrow}>{t('onboarding.permissionsEyebrow')}</Text>
      <Text style={styles.title}>{t('onboarding.notificationsTitle')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.notificationsSubtitle')}</Text>

      <View style={styles.illustrationWrap}>
        <View style={styles.bellCircle}>
          <Icon name="bell-ring-outline" size={92} color={colors.primary.saffron} />
        </View>
        <View style={[styles.ring, styles.ringLeft]} />
        <View style={[styles.ring, styles.ringRight]} />
      </View>

      <View style={styles.benefitsCard}>
        <View style={styles.bulletRow}>
          <Icon name="calendar-star" size={20} color={colors.gold.dark} />
          <Text style={styles.bulletText}>{t('onboarding.notificationsBenefits.panchang')}</Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="calendar-clock" size={20} color={colors.gold.dark} />
          <Text style={styles.bulletText}>{t('onboarding.notificationsBenefits.schedule')}</Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="account-voice" size={20} color={colors.gold.dark} />
          <Text style={styles.bulletText}>{t('onboarding.notificationsBenefits.satsang')}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleEnable} activeOpacity={0.9} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color={colors.text.white} />
          ) : (
            <Text style={styles.primaryButtonText}>{t('onboarding.enableNotifications')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleLater} activeOpacity={0.8} disabled={submitting}>
          <Text style={styles.secondaryButtonText}>{t('onboarding.maybeLater')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandLogo: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  spacer: {
    height: spacing.md,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.gold.dark,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: spacing.sm,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: colors.primary.maroon,
  },
  subtitle: {
    marginTop: spacing.md,
    fontSize: 17,
    lineHeight: 26,
    color: '#685646',
  },
  illustrationWrap: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
  },
  bellCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#FFF2D9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0D6A2',
    ...shadows.warm,
  },
  ring: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#F5C56B',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringLeft: {
    left: 42,
    top: 26,
    transform: [{ rotate: '-32deg' }],
  },
  ringRight: {
    right: 42,
    top: 26,
    transform: [{ rotate: '58deg' }],
  },
  benefitsCard: {
    marginTop: spacing.xl,
    backgroundColor: '#FFF9EF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1DEC0',
    padding: spacing.lg,
    gap: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.primary,
    fontWeight: '600',
  },
  actions: {
    marginTop: 'auto',
  },
  primaryButton: {
    backgroundColor: colors.primary.saffron,
    borderRadius: 18,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.warm,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.white,
  },
  secondaryButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
});
