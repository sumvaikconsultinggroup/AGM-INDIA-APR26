import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';
import { useI18n } from '../../i18n/I18nProvider';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import type { ModuleId } from '../../context/PermissionContext';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  route: string;
  module: ModuleId;
}

export function DashboardScreen({ navigation }: any) {
  const { admin, logout } = useAuth();
  const { role, canAccessModule } = usePermissions();
  const { t } = useI18n();
  const [stats, setStats] = useState<StatCard[]>([
    { title: t('admin.statUsers'), value: 0, icon: 'account-group', color: colors.primary.saffron, route: 'UsersStack', module: 'users' },
    { title: t('admin.statEvents'), value: 0, icon: 'calendar', color: colors.accent.peacock, route: 'Events', module: 'events' },
    { title: t('admin.statDonations'), value: 0, icon: 'hand-heart', color: colors.primary.maroon, route: 'Donations', module: 'donations' },
    { title: t('admin.statVolunteers'), value: 0, icon: 'account-heart', color: colors.accent.sage, route: 'VolunteersStack', module: 'volunteers' },
    { title: t('admin.statBooks'), value: 0, icon: 'book-open-variant', color: colors.gold.main, route: 'BooksStack', module: 'books' },
    { title: t('admin.statArticles'), value: 0, icon: 'newspaper', color: colors.primary.vermillion, route: 'Content', module: 'articles' },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const [usersRes, eventsRes, donationsRes, volunteersRes, booksRes, articlesRes] = await Promise.allSettled([
        api.get('/users'),
        api.get('/events'),
        api.get('/donate'),
        api.get('/volunteer'),
        api.get('/allbooks'),
        api.get('/articles'),
      ]);

      const responses = [usersRes, eventsRes, donationsRes, volunteersRes, booksRes, articlesRes];

      setStats(prev => prev.map((stat, i) => {
        const res = responses[i];
        if (res.status === 'fulfilled') {
          const data = res.value.data;
          const count = Array.isArray(data) ? data.length : 0;
          return { ...stat, value: count };
        }
        return stat;
      }));
    } catch {
      // Stats fetch failed silently
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    setStats(prev => [
      { ...prev[0], title: t('admin.statUsers') },
      { ...prev[1], title: t('admin.statEvents') },
      { ...prev[2], title: t('admin.statDonations') },
      { ...prev[3], title: t('admin.statVolunteers') },
      { ...prev[4], title: t('admin.statBooks') },
      { ...prev[5], title: t('admin.statArticles') },
    ]);
  }, [t]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.saffron} />}
    >
      {/* Welcome Header */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>
          {t('admin.welcome', { name: admin?.username || t('common.admin') })}
        </Text>
        <Text style={styles.roleText}>
          {t('admin.roleLabel', { role: role || admin?.role || 'admin' })}
        </Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.languageWrapper}>
        <LanguageSwitcher />
      </View>

      {/* Stats Grid — RBAC filtered */}
      <View style={styles.statsGrid}>
        {stats.filter(stat => canAccessModule(stat.module)).map((stat) => (
          <TouchableOpacity
            key={stat.title}
            style={styles.statCardContainer}
            onPress={() => navigation.navigate(stat.route)}
          >
            <Card style={[styles.statCard, { borderTopColor: stat.color }]}>
              <Card.Content style={styles.statContent}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('admin.quickActions')}</Text>
        <View style={styles.actionsRow}>
          {[
            { label: t('admin.newEvent'), route: 'Events' },
            { label: t('admin.newArticle'), route: 'Content' },
            { label: t('admin.messages'), route: 'MessagesStack' },
            { label: t('admin.bookings'), route: 'RoomsStack' },
          ].map(action => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionButton}
              onPress={() => navigation.navigate(action.route)}
            >
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.parchment },
  welcomeCard: {
    backgroundColor: colors.primary.maroon,
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'column',
  },
  welcomeText: { fontSize: 24, fontWeight: '700', color: colors.gold.light },
  roleText: { fontSize: 14, color: colors.gold.light, opacity: 0.8, marginTop: spacing.xs },
  logoutButton: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  logoutText: { color: colors.gold.light, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.sm },
  languageWrapper: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  statCardContainer: { width: '50%', padding: spacing.xs },
  statCard: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.md,
    borderTopWidth: 3,
    elevation: 2,
  },
  statContent: { alignItems: 'center', paddingVertical: spacing.md },
  statValue: { fontSize: 32, fontWeight: '700' },
  statTitle: { fontSize: 14, color: colors.text.secondary, marginTop: spacing.xs },
  section: { padding: spacing.md },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.primary.maroon, marginBottom: spacing.md },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: {
    backgroundColor: colors.background.warmWhite,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  actionLabel: { color: colors.primary.maroon, fontWeight: '600', fontSize: 13 },
});
