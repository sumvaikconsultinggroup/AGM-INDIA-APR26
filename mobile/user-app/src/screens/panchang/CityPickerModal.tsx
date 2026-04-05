import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getPanchangCities } from '../../services/panchangApi';
import { colors, spacing, borderRadius, shadows } from '../../theme';

export interface City {
  _id: string;
  name: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
  timezone?: string;
}

interface CityPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCity: (city: City) => void;
  onUseGPS: (lat: number, lng: number) => void;
}

export default function CityPickerModal({
  visible,
  onClose,
  onSelectCity,
  onUseGPS,
}: CityPickerModalProps) {
  const [search, setSearch] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      fetchCities();
      setSearch('');
    }
  }, [visible]);

  const fetchCities = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getPanchangCities();
      const payload = Array.isArray(res)
        ? res
        : (
            res &&
            typeof res === 'object' &&
            'data' in (res as Record<string, unknown>) &&
            Array.isArray((res as { data?: unknown }).data)
          )
          ? ((res as { data?: City[] }).data || [])
          : [];
      setCities(
        payload.map((city, index) => ({
          ...city,
          _id:
            city._id ||
            `${city.name}-${city.state || city.country}-${city.lat}-${city.lng}-${index}`,
        })),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Cities API unavailable:', error.message);
      }
      setCities([]);
      setFetchError('Unable to load live city data. Check Panchang API connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseGPS = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please enable location access to detect your city automatically.',
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      onUseGPS(location.coords.latitude, location.coords.longitude);
      onClose();
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your current location. Please select a city manually.');
    } finally {
      setGpsLoading(false);
    }
  };

  const filteredCities = cities.filter((city) => {
    const term = search.toLowerCase();
    return (
      city.name.toLowerCase().includes(term) ||
      (city.state?.toLowerCase().includes(term) ?? false) ||
      city.country.toLowerCase().includes(term)
    );
  });

  // Group cities: India first, then international
  const indianCities = filteredCities.filter((c) => c.country === 'India');
  const internationalCities = filteredCities.filter((c) => c.country !== 'India');

  const renderCity = useCallback(
    ({ item }: { item: City }) => (
      <TouchableOpacity
        style={styles.cityRow}
        onPress={() => {
          onSelectCity(item);
          onClose();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cityInfo}>
          <Text style={styles.cityName}>{item.name}</Text>
          <Text style={styles.cityRegion}>
            {item.state ? `${item.state}, ${item.country}` : item.country}
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
    ),
    [onSelectCity, onClose],
  );

  const sections = [
    ...(indianCities.length > 0
      ? [{ type: 'header' as const, title: 'India', key: 'header-india' }]
      : []),
    ...indianCities.map((c) => ({ type: 'city' as const, city: c, key: c._id })),
    ...(internationalCities.length > 0
      ? [{ type: 'header' as const, title: 'International', key: 'header-intl' }]
      : []),
    ...internationalCities.map((c) => ({ type: 'city' as const, city: c, key: c._id })),
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select City</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* GPS Button */}
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={handleUseGPS}
          disabled={gpsLoading}
          activeOpacity={0.7}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color={colors.primary.saffron} />
          ) : (
            <Icon name="crosshairs-gps" size={20} color={colors.primary.saffron} />
          )}
          <Text style={styles.gpsButtonText}>
            {gpsLoading ? 'Detecting location...' : 'Use My Location'}
          </Text>
        </TouchableOpacity>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city or state..."
            placeholderTextColor={colors.text.secondary}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* City List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.saffron} />
          </View>
        ) : fetchError ? (
          <View style={styles.loadingContainer}>
            <Icon name="alert-circle-outline" size={28} color={colors.primary.vermillion} />
            <Text style={styles.errorTitle}>City list unavailable</Text>
            <Text style={styles.errorMessage}>{fetchError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCities} activeOpacity={0.8}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={sections}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{item.title}</Text>
                  </View>
                );
              }
              return renderCity({ item: item.city! });
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="map-marker-off" size={40} color={colors.text.secondary} />
                <Text style={styles.emptyText}>No cities found</Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.lg : spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  closeButton: {
    padding: spacing.xs,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary.saffron,
    ...shadows.warm,
  },
  gpsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary.saffron,
    marginLeft: spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm + 2 : 0,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? spacing.xs : spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.sandstone,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary.maroon,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cityRegion: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  errorMessage: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xl,
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 13,
  },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.maroon,
  },
  retryButtonText: {
    color: colors.text.white,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },
});
