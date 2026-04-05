import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius } from '../theme';
import { useI18n } from '../i18n/I18nProvider';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { UsersScreen } from '../screens/users/UsersScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { DonationsScreen } from '../screens/donations/DonationsScreen';
import { ScheduleScreen } from '../screens/schedule/ScheduleScreen';
import { ArticlesScreen } from '../screens/content/ArticlesScreen';
import { VideosScreen } from '../screens/content/VideosScreen';
import { PodcastsScreen } from '../screens/content/PodcastsScreen';
import { BooksScreen } from '../screens/books/BooksScreen';
import { RoomBookingScreen } from '../screens/rooms/RoomBookingScreen';
import { VolunteersScreen } from '../screens/volunteers/VolunteersScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';

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

// "More" screen — grid of all remaining admin sections
function MoreScreen({ navigation }: any) {
  const { t } = useI18n();
  const items = [
    { label: t('tabs.schedule'), icon: '🗓️', screen: 'ScheduleStack' },
    { label: t('admin.articles'), icon: '📰', screen: 'ArticlesStack' },
    { label: t('admin.videos'), icon: '🎬', screen: 'VideosStack' },
    { label: t('admin.podcasts'), icon: '🎙️', screen: 'PodcastsStack' },
    { label: t('admin.books'), icon: '📚', screen: 'BooksStack' },
    { label: t('admin.rooms'), icon: '🏠', screen: 'RoomsStack' },
    { label: t('admin.users'), icon: '👥', screen: 'UsersStack' },
    { label: t('admin.volunteers'), icon: '🤝', screen: 'VolunteersStack' },
    { label: t('admin.messages'), icon: '💬', screen: 'MessagesStack' },
  ];

  return (
    <ScrollView style={moreStyles.container} contentContainerStyle={moreStyles.content}>
      <Text style={moreStyles.title}>{t('admin.allSections')}</Text>
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
            <Text style={moreStyles.cardIcon}>{item.icon}</Text>
            <Text style={moreStyles.cardLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const moreStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.parchment },
  content: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary.maroon, marginBottom: spacing.lg },
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
  },
  cardIcon: { fontSize: 28, marginBottom: spacing.xs },
  cardLabel: { fontSize: 12, fontWeight: '600', color: colors.text.primary, textAlign: 'center' },
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
const ArticlesStack = makeStack('Articles', ArticlesScreen, 'admin.articles');
const VideosStack = makeStack('Videos', VideosScreen, 'admin.videos');
const PodcastsStack = makeStack('Podcasts', PodcastsScreen, 'admin.podcasts');
const BooksStack = makeStack('Books', BooksScreen, 'admin.books');
const RoomsStack = makeStack('Rooms', RoomBookingScreen, 'admin.rooms');
const UsersStack = makeStack('Users', UsersScreen, 'admin.users');
const VolunteersStack = makeStack('Volunteers', VolunteersScreen, 'admin.volunteers');
const MessagesStack = makeStack('Messages', MessagesScreen, 'admin.messages');

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
            <Stack.Screen name="ArticlesStack" component={ArticlesStack} />
            <Stack.Screen name="VideosStack" component={VideosStack} />
            <Stack.Screen name="PodcastsStack" component={PodcastsStack} />
            <Stack.Screen name="BooksStack" component={BooksStack} />
            <Stack.Screen name="RoomsStack" component={RoomsStack} />
            <Stack.Screen name="UsersStack" component={UsersStack} />
            <Stack.Screen name="VolunteersStack" component={VolunteersStack} />
            <Stack.Screen name="MessagesStack" component={MessagesStack} />
          </>
        ) : (
          <Stack.Screen name="AdminLogin" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
