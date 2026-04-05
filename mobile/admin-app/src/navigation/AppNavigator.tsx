import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';
import type { ModuleId } from '../context/PermissionContext';
import { colors, spacing, borderRadius } from '../theme';
import { useI18n } from '../i18n/I18nProvider';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { UsersScreen } from '../screens/users/UsersScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { DonationsScreen } from '../screens/donations/DonationsScreen';
import { ScheduleScreen } from '../screens/schedule/ScheduleScreen';
import { AppointmentInboxScreen } from '../screens/schedule/AppointmentInboxScreen';
import { ArticlesScreen } from '../screens/content/ArticlesScreen';
import { VideosScreen } from '../screens/content/VideosScreen';
import { PodcastsScreen } from '../screens/content/PodcastsScreen';
import { BooksScreen } from '../screens/books/BooksScreen';
import { RoomBookingScreen } from '../screens/rooms/RoomBookingScreen';
import { VolunteersScreen } from '../screens/volunteers/VolunteersScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { TeamManagementScreen } from '../screens/team/TeamManagementScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const linking: LinkingOptions<any> = {
  prefixes: [Linking.createURL('/'), 'https://admin.avdheshanandg.org'],
  config: {
    screens: {
      AdminMain: {
        screens: {
          Dashboard: '',
          Events: 'events',
          Donations: 'donations',
          Content: 'content',
          More: 'more',
        },
      },
      ScheduleStack: 'schedule',
      AppointmentInboxStack: 'appointments',
      ArticlesStack: 'articles',
      VideosStack: 'videos',
      PodcastsStack: 'podcasts',
      BooksStack: 'books',
      RoomsStack: 'rooms',
      UsersStack: 'users',
      VolunteersStack: 'volunteers',
      MessagesStack: 'messages',
      AdminLogin: 'login',
    },
  },
};

function TabIcon({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  const icons: Record<string, React.ComponentProps<typeof Icon>['name']> = {
    Dashboard: 'view-dashboard',
    Events: 'calendar-month',
    Content: 'text-box-multiple',
    Donations: 'hand-heart',
    More: 'apps',
  };
  return <Icon name={icons[label] || 'circle'} size={focused ? 23 : 21} color={color} />;
}

// Icon mapping for More screen items (enterprise-grade, no emojis)
const MODULE_ICONS: Record<string, React.ComponentProps<typeof Icon>['name']> = {
  ScheduleStack: 'calendar-clock',
  AppointmentInboxStack: 'clipboard-list-outline',
  ArticlesStack: 'newspaper-variant-outline',
  VideosStack: 'video-outline',
  PodcastsStack: 'microphone-outline',
  BooksStack: 'book-open-page-variant-outline',
  RoomsStack: 'door-open',
  UsersStack: 'account-group-outline',
  VolunteersStack: 'hand-heart-outline',
  MessagesStack: 'message-text-outline',
  TeamStack: 'shield-account-outline',
};

// Module ID mapping for permission checks
const SCREEN_TO_MODULE: Record<string, ModuleId> = {
  ScheduleStack: 'schedule',
  AppointmentInboxStack: 'schedule',
  ArticlesStack: 'articles',
  VideosStack: 'videos',
  PodcastsStack: 'podcasts',
  BooksStack: 'books',
  RoomsStack: 'rooms',
  UsersStack: 'users',
  VolunteersStack: 'volunteers',
  MessagesStack: 'messages',
  TeamStack: 'users',
};

// "More" screen — grid of all remaining admin sections (RBAC-filtered)
function MoreScreen({ navigation }: any) {
  const { t } = useI18n();
  const { canAccessModule, role } = usePermissions();

  const allItems = [
    { label: t('tabs.schedule'), screen: 'ScheduleStack' },
    { label: t('admin.appointments'), screen: 'AppointmentInboxStack' },
    { label: t('admin.articles'), screen: 'ArticlesStack' },
    { label: t('admin.videos'), screen: 'VideosStack' },
    { label: t('admin.podcasts'), screen: 'PodcastsStack' },
    { label: t('admin.books'), screen: 'BooksStack' },
    { label: t('admin.rooms'), screen: 'RoomsStack' },
    { label: t('admin.users'), screen: 'UsersStack' },
    { label: t('admin.volunteers'), screen: 'VolunteersStack' },
    { label: t('admin.messages'), screen: 'MessagesStack' },
    { label: 'Team', screen: 'TeamStack' },
  ];

  // Filter items based on RBAC permissions
  const items = allItems.filter(item => {
    const moduleId = SCREEN_TO_MODULE[item.screen];
    return moduleId ? canAccessModule(moduleId) : true;
  });

  return (
    <ScrollView style={moreStyles.container} contentContainerStyle={moreStyles.content}>
      <View style={moreStyles.header}>
        <Text style={moreStyles.title}>{t('admin.allSections')}</Text>
        <View style={moreStyles.roleBadge}>
          <Text style={moreStyles.roleBadgeText}>{role.toUpperCase()}</Text>
        </View>
      </View>
      <View style={moreStyles.grid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={moreStyles.card}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('admin.openSection', { section: item.label })}
          >
            <Icon
              name={MODULE_ICONS[item.screen] || 'circle-outline'}
              size={28}
              color={colors.primary.saffron}
              style={{ marginBottom: spacing.xs }}
            />
            <Text style={moreStyles.cardLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {items.length === 0 && (
        <View style={moreStyles.emptyState}>
          <Icon name="lock-outline" size={48} color={colors.text.secondary} />
          <Text style={moreStyles.emptyText}>No additional sections available for your role.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const moreStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.parchment },
  content: { padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary.maroon },
  roleBadge: {
    backgroundColor: colors.primary.saffron,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardLabel: { fontSize: 12, fontWeight: '600', color: colors.text.primary, textAlign: 'center' },
  emptyState: { alignItems: 'center', marginTop: spacing.xxl },
  emptyText: { fontSize: 14, color: colors.text.secondary, marginTop: spacing.md, textAlign: 'center' },
});

// Wrap each screen in its own stack for proper header
function makeStack(name: string, Component: React.ComponentType<any>, titleKey: string) {
  return function WrappedStack() {
    const { t } = useI18n();
    return (
      <Stack.Navigator>
        <Stack.Screen name={name} component={Component} options={{
          title: t(titleKey),
          headerStyle: { backgroundColor: colors.background.warmWhite },
          headerTintColor: colors.primary.maroon,
          headerTitleStyle: { fontWeight: '600' },
        }} />
      </Stack.Navigator>
    );
  };
}

const ScheduleStack = makeStack('Schedule', ScheduleScreen, 'tabs.schedule');
const AppointmentInboxStack = makeStack('Appointments', AppointmentInboxScreen, 'admin.appointments');
const ArticlesStack = makeStack('Articles', ArticlesScreen, 'admin.articles');
const VideosStack = makeStack('Videos', VideosScreen, 'admin.videos');
const PodcastsStack = makeStack('Podcasts', PodcastsScreen, 'admin.podcasts');
const BooksStack = makeStack('Books', BooksScreen, 'admin.books');
const RoomsStack = makeStack('Rooms', RoomBookingScreen, 'admin.rooms');
const UsersStack = makeStack('Users', UsersScreen, 'admin.users');
const VolunteersStack = makeStack('Volunteers', VolunteersScreen, 'admin.volunteers');
const MessagesStack = makeStack('Messages', MessagesScreen, 'admin.messages');
const TeamStack = makeStack('Team', TeamManagementScreen, 'admin.users');

function AdminTabs() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 6);
  const { t } = useI18n();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary.saffron,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.warmWhite,
          borderTopColor: colors.border.gold as string,
          borderTopWidth: 1,
          paddingBottom: bottomPad,
          paddingTop: 6,
          height: 56 + bottomPad,
        },
        tabBarIcon: ({ focused, color }) => (
          <TabIcon label={route.name} focused={focused} color={color} />
        ),
        headerStyle: { backgroundColor: colors.background.warmWhite },
        headerTintColor: colors.primary.maroon,
        headerTitleStyle: { fontWeight: '600' as const },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: t('tabs.dashboard') }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ title: t('tabs.events') }} />
      <Tab.Screen name="Donations" component={DonationsScreen} options={{ title: t('tabs.donations') }} />
      <Tab.Screen name="Content" component={ArticlesScreen} options={{ title: t('tabs.content') }} />
      <Tab.Screen name="More" component={MoreScreen} options={{ title: t('tabs.more'), headerShown: false }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.parchment }}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="AdminMain" component={AdminTabs} />
            <Stack.Screen name="ScheduleStack" component={ScheduleStack} />
            <Stack.Screen name="AppointmentInboxStack" component={AppointmentInboxStack} />
            <Stack.Screen name="ArticlesStack" component={ArticlesStack} />
            <Stack.Screen name="VideosStack" component={VideosStack} />
            <Stack.Screen name="PodcastsStack" component={PodcastsStack} />
            <Stack.Screen name="BooksStack" component={BooksStack} />
            <Stack.Screen name="RoomsStack" component={RoomsStack} />
            <Stack.Screen name="UsersStack" component={UsersStack} />
            <Stack.Screen name="VolunteersStack" component={VolunteersStack} />
            <Stack.Screen name="MessagesStack" component={MessagesStack} />
            <Stack.Screen name="TeamStack" component={TeamStack} />
          </>
        ) : (
          <Stack.Screen name="AdminLogin" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
