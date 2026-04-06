import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_STORAGE_KEY = '@app_onboarding_state';
const CURRENT_ONBOARDING_VERSION = 2;

export interface OnboardingState {
  completed: boolean;
  version?: number;
  languageCode?: string;
  notificationsPrompted?: boolean;
  notificationsEnabled?: boolean;
  locationPrompted?: boolean;
  locationEnabled?: boolean;
  completedAt?: string;
}

interface OnboardingContextType {
  state: OnboardingState;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  updateState: (partial: Partial<OnboardingState>) => Promise<void>;
  completeOnboarding: (partial?: Partial<OnboardingState>) => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const DEFAULT_STATE: OnboardingState = {
  completed: false,
  version: CURRENT_ONBOARDING_VERSION,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (!mounted) return;
        if (stored) {
          const parsed = JSON.parse(stored) as OnboardingState;
          const nextState =
            parsed.version === CURRENT_ONBOARDING_VERSION
              ? { ...DEFAULT_STATE, ...parsed }
              : {
                  ...DEFAULT_STATE,
                  languageCode: parsed.languageCode,
                };
          setState(nextState);
          await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(nextState));
        }
      } catch {
        if (mounted) {
          setState(DEFAULT_STATE);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const persist = async (nextState: OnboardingState) => {
    setState(nextState);
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(nextState));
  };

  const updateState = async (partial: Partial<OnboardingState>) => {
    const nextState = { ...state, ...partial, version: CURRENT_ONBOARDING_VERSION };
    await persist(nextState);
  };

  const completeOnboarding = async (partial?: Partial<OnboardingState>) => {
    const nextState: OnboardingState = {
      ...state,
      ...partial,
      version: CURRENT_ONBOARDING_VERSION,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    await persist(nextState);
  };

  const resetOnboarding = async () => {
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setState(DEFAULT_STATE);
  };

  const value = useMemo(
    () => ({
      state,
      isLoading,
      hasCompletedOnboarding: state.completed,
      updateState,
      completeOnboarding,
      resetOnboarding,
    }),
    [state, isLoading]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
