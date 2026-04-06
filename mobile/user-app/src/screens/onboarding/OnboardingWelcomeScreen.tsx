import React, { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LanguagePickerModal from '../../components/LanguagePickerModal';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors, borderRadius, spacing, shadows } from '../../theme';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - spacing.lg * 2;
const LOGO_SOURCE = require('../../../assets/images/avdheshanandg-mission-logo.jpg');

type Slide = {
  icon: React.ComponentProps<typeof Icon>['name'];
  eyebrow: string;
  title: string;
  description: string;
};

export function OnboardingWelcomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { updateState, completeOnboarding } = useOnboarding();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [languageVisible, setLanguageVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const slides = useMemo<Slide[]>(
    () => [
      {
        icon: 'calendar-star',
        eyebrow: t('onboarding.slides.panchangEyebrow'),
        title: t('onboarding.slides.panchangTitle'),
        description: t('onboarding.slides.panchangDescription'),
      },
      {
        icon: 'calendar-clock',
        eyebrow: t('onboarding.slides.scheduleEyebrow'),
        title: t('onboarding.slides.scheduleTitle'),
        description: t('onboarding.slides.scheduleDescription'),
      },
      {
        icon: 'play-circle-outline',
        eyebrow: t('onboarding.slides.wisdomEyebrow'),
        title: t('onboarding.slides.wisdomTitle'),
        description: t('onboarding.slides.wisdomDescription'),
      },
      {
        icon: 'hand-heart',
        eyebrow: t('onboarding.slides.sevaEyebrow'),
        title: t('onboarding.slides.sevaTitle'),
        description: t('onboarding.slides.sevaDescription'),
      },
    ],
    [t]
  );

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    setCurrentIndex(nextIndex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.brandMark}>
          <Image source={LOGO_SOURCE} style={styles.brandLogo} />
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandText}>{t('onboarding.brand')}</Text>
            <Text style={styles.brandSubtext}>{t('onboarding.brandTagline')}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setLanguageVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.languageButtonText}>{t('onboarding.changeLanguage')}</Text>
          <Icon name="translate" size={18} color={colors.primary.maroon} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={styles.carousel}
      >
        {slides.map((slide, index) => (
          <View key={slide.title} style={styles.slide}>
            <LinearGradient
              colors={index % 2 === 0 ? ['#FFF4D8', '#FFE7B6'] : ['#FFE8D7', '#FFD2B2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.visualCard}
            >
              <View style={styles.visualHalo} />
              <View style={styles.visualTopRow}>
                <View style={styles.visualIconWrap}>
                  <Icon name={slide.icon} size={46} color={colors.primary.maroon} />
                </View>
                <Image source={LOGO_SOURCE} style={styles.visualLogo} />
              </View>
              <Text style={styles.visualEyebrow}>{slide.eyebrow}</Text>
              <Text style={styles.visualTitle}>{slide.title}</Text>
              <Text style={styles.visualDescription}>{slide.description}</Text>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {slides.map((_, index) => (
          <View key={index} style={[styles.dot, currentIndex === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.contentBlock}>
        <Text style={styles.heading}>{t('onboarding.welcomeTitle')}</Text>
        <Text style={styles.subheading}>{t('onboarding.welcomeSubtitle')}</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('OnboardingNotifications')}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>{t('onboarding.getStarted')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>{t('onboarding.existingLogin')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => completeOnboarding()}
          activeOpacity={0.8}
        >
          <Text style={styles.ghostButtonText}>{t('onboarding.continueAsGuest')}</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>{t('onboarding.footer')}</Text>
      </View>

      <LanguagePickerModal
        visible={languageVisible}
        onClose={() => setLanguageVisible(false)}
        onSelectLanguage={(languageCode) => updateState({ languageCode })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  brandLogo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF9EF',
  },
  brandTextWrap: {
    flex: 1,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  brandSubtext: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: colors.gold.dark,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  languageButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  carousel: {
    paddingBottom: spacing.md,
  },
  slide: {
    width: SLIDE_WIDTH,
    marginRight: spacing.md,
  },
  visualCard: {
    borderRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    minHeight: 360,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0D6A2',
    ...shadows.temple,
  },
  visualTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  visualHalo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.28)',
    top: -40,
    right: -40,
  },
  visualIconWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualLogo: {
    width: 74,
    height: 74,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  visualEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.gold.dark,
    marginBottom: spacing.sm,
  },
  visualTitle: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '800',
    color: colors.primary.maroon,
  },
  visualDescription: {
    marginTop: spacing.md,
    fontSize: 16,
    lineHeight: 24,
    color: '#6A5445',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D7C9B4',
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary.saffron,
  },
  contentBlock: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  heading: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: colors.primary.maroon,
    textAlign: 'center',
  },
  subheading: {
    marginTop: spacing.md,
    fontSize: 16,
    lineHeight: 24,
    color: '#6C5A4C',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryButton: {
    width: '100%',
    marginTop: spacing.xl,
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
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  ghostButton: {
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  ghostButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  footerText: {
    marginTop: spacing.md,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
