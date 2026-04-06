import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors, spacing, shadows } from '../../theme';

const STORAGE_KEY_CITY = '@panchang_selected_city';
const LOGO_SOURCE = require('../../../assets/images/avdheshanandg-mission-logo.png');

export function OnboardingLocationScreen() {
  const { t } = useTranslation();
  const { completeOnboarding } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleUseLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        await completeOnboarding({
          locationPrompted: true,
          locationEnabled: false,
        });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const place = reverseGeocode[0];
      const cityPayload = {
        _id: 'onboarding-gps',
        name: place?.city || place?.district || place?.region || 'Current Location',
        state: place?.region || '',
        country: place?.country || 'India',
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      };

      await AsyncStorage.setItem(STORAGE_KEY_CITY, JSON.stringify(cityPayload));
      await completeOnboarding({
        locationPrompted: true,
        locationEnabled: true,
      });
    } catch (error) {
      Alert.alert(
        t('onboarding.locationErrorTitle'),
        t('onboarding.locationErrorMessage')
      );
      await completeOnboarding({
        locationPrompted: true,
        locationEnabled: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLater = async () => {
    await completeOnboarding({
      locationPrompted: true,
      locationEnabled: false,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <Image source={LOGO_SOURCE} style={styles.brandLogo} />
        <Text style={styles.brandText}>{t('onboarding.brand')}</Text>
      </View>
      <View style={styles.spacer} />
      <Text style={styles.eyebrow}>{t('onboarding.locationEyebrow')}</Text>
      <Text style={styles.title}>{t('onboarding.locationTitle')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.locationSubtitle')}</Text>

      <View style={styles.illustrationWrap}>
        <View style={styles.mapCard}>
          <View style={styles.routeLine} />
          <View style={[styles.pin, styles.pinPrimary]}>
            <Icon name="map-marker" size={26} color={colors.text.white} />
          </View>
          <View style={[styles.pin, styles.pinSecondary]}>
            <Icon name="temple-hindu" size={20} color={colors.primary.maroon} />
          </View>
          <View style={[styles.pin, styles.pinThird]}>
            <Icon name="calendar-star" size={18} color={colors.gold.dark} />
          </View>
        </View>
      </View>

      <View style={styles.benefitsCard}>
        <View style={styles.bulletRow}>
          <Icon name="clock-time-four-outline" size={20} color={colors.gold.dark} />
          <Text style={styles.bulletText}>{t('onboarding.locationBenefits.panchang')}</Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="crosshairs-gps" size={20} color={colors.gold.dark} />
          <Text style={styles.bulletText}>{t('onboarding.locationBenefits.city')}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleUseLocation} activeOpacity={0.9} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.text.white} />
          ) : (
            <Text style={styles.primaryButtonText}>{t('onboarding.useMyLocation')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleLater} activeOpacity={0.8} disabled={loading}>
          <Text style={styles.secondaryButtonText}>{t('onboarding.chooseLater')}</Text>
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
  },
  mapCard: {
    width: 250,
    height: 220,
    borderRadius: 32,
    backgroundColor: '#FFF3DE',
    borderWidth: 1,
    borderColor: '#F0D6A2',
    ...shadows.warm,
  },
  routeLine: {
    position: 'absolute',
    left: 46,
    right: 48,
    top: 110,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EBCB8F',
    transform: [{ rotate: '-18deg' }],
  },
  pin: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinPrimary: {
    left: 24,
    top: 44,
    backgroundColor: colors.primary.saffron,
  },
  pinSecondary: {
    right: 32,
    top: 58,
    backgroundColor: '#FFF9EF',
    borderWidth: 1,
    borderColor: '#F1D6A4',
  },
  pinThird: {
    left: 100,
    bottom: 38,
    backgroundColor: '#FFF9EF',
    borderWidth: 1,
    borderColor: '#F1D6A4',
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
