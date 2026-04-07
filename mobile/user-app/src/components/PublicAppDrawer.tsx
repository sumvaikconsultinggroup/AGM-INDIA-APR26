import React, { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LanguageDrawer from './LanguageDrawer';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { borderRadius, colors, shadows, spacing, typography } from '../theme';

const LOGO_SOURCE = require('../../assets/images/avdheshanandg-mission-logo.png');
const SWAMIJI_SOURCE = require('../../assets/images/swamiji-onboarding.jpg');

type DrawerTarget =
  | { type: 'tab'; name: 'Home' | 'Explore' | 'Schedule' | 'Donate' | 'Profile' }
  | {
      type: 'screen';
      name:
        | 'AboutSwami'
        | 'Mission'
        | 'MantraDiksha'
        | 'ContactForm'
        | 'VolunteerForm'
        | 'PrivacyPolicy'
        | 'TermsOfService';
      params?: RootStackParamList[keyof RootStackParamList];
    }
  | { type: 'language' };

type DrawerItem = {
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  target: DrawerTarget;
};

interface PublicAppDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function PublicAppDrawer({ visible, onClose }: PublicAppDrawerProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [languageVisible, setLanguageVisible] = useState(false);

  const primaryItems = useMemo(
    (): DrawerItem[] => [
      { icon: 'home-variant', label: t('tabs.home'), target: { type: 'tab', name: 'Home' } as DrawerTarget },
      { icon: 'compass', label: t('tabs.explore'), target: { type: 'tab', name: 'Explore' } as DrawerTarget },
      { icon: 'calendar', label: t('tabs.schedule'), target: { type: 'tab', name: 'Schedule' } as DrawerTarget },
      { icon: 'hand-heart', label: t('tabs.donate'), target: { type: 'tab', name: 'Donate' } as DrawerTarget },
      { icon: 'account-circle', label: t('tabs.profile'), target: { type: 'tab', name: 'Profile' } as DrawerTarget },
    ],
    [t]
  );

  const missionItems = useMemo(
    (): DrawerItem[] => [
      {
        icon: 'account-star-outline',
        label: t('appDrawer.items.aboutSwami'),
        target: { type: 'screen', name: 'AboutSwami' } as DrawerTarget,
      },
      {
        icon: 'book-heart-outline',
        label: t('appDrawer.items.missionTeachings'),
        target: { type: 'screen', name: 'Mission' } as DrawerTarget,
      },
      {
        icon: 'om',
        label: t('appDrawer.items.mantraDiksha'),
        target: { type: 'screen', name: 'MantraDiksha' } as DrawerTarget,
      },
      {
        icon: 'email-heart-outline',
        label: t('appDrawer.items.writeToSwami'),
        target: {
          type: 'screen',
          name: 'ContactForm',
          params: {
            prefillSubject: 'Message for Swami Ji',
            titleOverride: t('appDrawer.items.writeToSwami'),
            introTitleOverride: t('contact.writeToSwamiTitle'),
            introTextOverride: t('contact.writeToSwamiSubtitle'),
            messagePlaceholder: t('contact.placeholders.writeToSwami'),
          },
        } as DrawerTarget,
      },
      {
        icon: 'hand-heart-outline',
        label: t('home.quickLinksItems.volunteer'),
        target: { type: 'screen', name: 'VolunteerForm' } as DrawerTarget,
      },
    ],
    [t]
  );

  const policyItems = useMemo(
    (): DrawerItem[] => [
      {
        icon: 'shield-check-outline',
        label: t('appDrawer.items.privacy'),
        target: { type: 'screen', name: 'PrivacyPolicy' } as DrawerTarget,
      },
      {
        icon: 'scale-balance',
        label: t('appDrawer.items.terms'),
        target: { type: 'screen', name: 'TermsOfService' } as DrawerTarget,
      },
      {
        icon: 'translate',
        label: t('profile.language'),
        target: { type: 'language' } as DrawerTarget,
      },
    ],
    [t]
  );

  const handleSelect = (target: DrawerTarget) => {
    if (target.type === 'language') {
      setLanguageVisible(true);
      return;
    }

    onClose();

    if (target.type === 'tab') {
      navigation.navigate('Main', { screen: target.name });
      return;
    }

    navigation.navigate(target.name, target.params as any);
  };

  const renderSection = (
    title: string,
    items: DrawerItem[]
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <TouchableOpacity
          key={`${title}-${item.label}`}
          style={styles.item}
          onPress={() => handleSelect(item.target)}
          activeOpacity={0.85}
        >
          <View style={styles.itemIconWrap}>
            <Icon name={item.icon} size={20} color={colors.primary.saffron} />
          </View>
          <Text style={styles.itemLabel}>{item.label}</Text>
          <Icon name="chevron-right" size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onClose} />
          <View style={styles.drawer}>
            <View style={styles.hero}>
              <Image source={SWAMIJI_SOURCE} style={styles.heroImage} />
              <View style={styles.heroOverlay} />
              <View style={styles.heroContent}>
                <View style={styles.heroTop}>
                  <View style={styles.brandSeal}>
                    <Image source={LOGO_SOURCE} style={styles.brandLogo} />
                  </View>
                  <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
                    <Icon name="close" size={18} color={colors.primary.maroon} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.heroEyebrow}>{t('appDrawer.eyebrow')}</Text>
                <Text style={styles.heroTitle}>{t('appDrawer.title')}</Text>
                <Text style={styles.heroSubtitle}>{t('appDrawer.subtitle')}</Text>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {renderSection(t('appDrawer.sections.browse'), primaryItems)}
              {renderSection(t('appDrawer.sections.mission'), missionItems)}
              {renderSection(t('appDrawer.sections.policies'), policyItems)}
              <View style={styles.footerCard}>
                <Text style={styles.footerTitle}>{t('appDrawer.footerTitle')}</Text>
                <Text style={styles.footerText}>{t('appDrawer.footerText')}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <LanguageDrawer visible={languageVisible} onClose={() => setLanguageVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(46, 27, 10, 0.3)',
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    width: '84%',
    maxWidth: 390,
    backgroundColor: '#FFF8EB',
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderColor: '#F0D8AF',
    ...shadows.temple,
  },
  hero: {
    minHeight: 232,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74, 0, 16, 0.46)',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandSeal: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,245,231,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    ...typography.label,
    color: 'rgba(255,255,255,0.82)',
  },
  heroTitle: {
    ...typography.h1,
    color: colors.text.white,
    marginTop: spacing.sm,
  },
  heroSubtitle: {
    ...typography.bodySm,
    color: 'rgba(255,255,255,0.88)',
    marginTop: spacing.sm,
    maxWidth: 260,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.gold.dark,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  itemIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF2DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemLabel: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  footerCard: {
    borderRadius: borderRadius.xl,
    backgroundColor: '#FFF2DB',
    borderWidth: 1,
    borderColor: '#F0D29D',
    padding: spacing.lg,
  },
  footerTitle: {
    ...typography.title,
    color: colors.primary.maroon,
    marginBottom: spacing.sm,
  },
  footerText: {
    ...typography.bodySm,
    color: colors.text.secondary,
  },
});
