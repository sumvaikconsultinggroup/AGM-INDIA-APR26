import './src/i18n';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { colors } from './src/theme';

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
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <OnboardingProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </OnboardingProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
