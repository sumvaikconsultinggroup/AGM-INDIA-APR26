import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const omScale = new Animated.Value(0.5);
  const omOpacity = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      // Om symbol appears and scales
      Animated.parallel([
        Animated.spring(omScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(omOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Text fades in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Hold for a moment
      Animated.delay(800),
    ]).start(() => onComplete());
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.omSymbol,
          {
            transform: [{ scale: omScale }],
            opacity: omOpacity,
          },
        ]}
      >
        ॐ
      </Animated.Text>
      <Animated.View style={{ opacity: textOpacity }}>
        <Text style={styles.title}>Swami Avdheshanand</Text>
        <Text style={styles.subtitle}>Hari Om Tat Sat</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.parchment,
  },
  omSymbol: {
    fontSize: 80,
    color: colors.gold.main,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.maroon,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});
