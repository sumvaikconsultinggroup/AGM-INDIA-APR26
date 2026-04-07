import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { PermissionProvider } from './src/context/PermissionContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';
import { I18nProvider } from './src/i18n/I18nProvider';
import { AdminNotificationBootstrap } from './src/components/common/AdminNotificationBootstrap';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.saffron,
    secondary: colors.primary.maroon,
    tertiary: colors.gold.main,
    surface: colors.background.warmWhite,
    background: colors.background.parchment,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <I18nProvider>
          <AuthProvider>
            <PermissionProvider>
              <StatusBar style="dark" />
              <AdminNotificationBootstrap />
              <AppNavigator />
            </PermissionProvider>
          </AuthProvider>
        </I18nProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
