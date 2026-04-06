import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import LanguageDrawer from '../../components/LanguageDrawer';

interface MenuItem {
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [languageDrawerVisible, setLanguageDrawerVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleMenuPress = (item: string) => {
    // Placeholder for navigation to detail screens
    Alert.alert(t('common.comingSoon'), t('profile.featureComingSoon', { item }));
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'calendar-check',
      title: t('profile.menu.registrations.title'),
      subtitle: t('profile.menu.registrations.subtitle'),
      onPress: () => handleMenuPress(t('profile.menu.registrations.title')),
      showChevron: true,
    },
    {
      icon: 'hand-heart',
      title: t('profile.menu.donations.title'),
      subtitle: t('profile.menu.donations.subtitle'),
      onPress: () => navigation.navigate('DonationHistory'),
      showChevron: true,
    },
    {
      icon: 'home-city',
      title: t('profile.menu.bookings.title'),
      subtitle: t('profile.menu.bookings.subtitle'),
      onPress: () => handleMenuPress(t('profile.menu.bookings.title')),
      showChevron: true,
    },
    {
      icon: 'translate',
      title: t('profile.language'),
      onPress: () => setLanguageDrawerVisible(true),
      showChevron: true,
    },
    {
      icon: 'cog',
      title: t('profile.settings'),
      subtitle: t('profile.menu.settings.subtitle'),
      onPress: () => handleMenuPress(t('profile.settings')),
      showChevron: true,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <LinearGradient
        colors={[colors.primary.saffron, colors.primary.maroon]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarSymbol}>ॐ</Text>
        </View>
        <Text style={styles.userName}>{user?.name || t('profile.devoteeFallback')}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
        {user?.phone && (
          <View style={styles.phoneBadge}>
            <Icon name="phone" size={14} color={colors.gold.light} />
            <Text style={styles.phoneText}>{user.phone}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="calendar-check" size={24} color={colors.primary.saffron} />
          <Text style={styles.statValue}>-</Text>
          <Text style={styles.statLabel}>{t('profile.stats.registrations')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="hand-heart" size={24} color={colors.primary.saffron} />
          <Text style={styles.statValue}>-</Text>
          <Text style={styles.statLabel}>{t('profile.stats.donations')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="home-city" size={24} color={colors.primary.saffron} />
          <Text style={styles.statValue}>-</Text>
          <Text style={styles.statLabel}>{t('profile.stats.bookings')}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>{t('profile.title')}</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuIconContainer}>
              <Icon name={item.icon} size={22} color={colors.primary.saffron} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              )}
            </View>
            {item.showChevron && (
              <Icon name="chevron-right" size={24} color={colors.text.secondary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color={colors.primary.vermillion} />
        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>AGM India App v1.0.0</Text>
        <Text style={styles.appTagline}>{t('profile.appTagline')}</Text>
      </View>

      <View style={{ height: spacing.xxl }} />

      <LanguageDrawer
        visible={languageDrawerVisible}
        onClose={() => setLanguageDrawerVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  headerGradient: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.gold.light,
  },
  avatarSymbol: {
    fontSize: 36,
    color: colors.gold.light,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.white,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  phoneText: {
    fontSize: 13,
    color: colors.gold.light,
    marginLeft: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.gold as string,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  menuSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.warmWhite,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(227, 66, 52, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(227, 66, 52, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.vermillion,
    marginLeft: spacing.sm,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  appVersion: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  appTagline: {
    fontSize: 14,
    color: colors.gold.main,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});
