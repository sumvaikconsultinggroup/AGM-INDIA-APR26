import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { Book } from '../../types';

const { width } = Dimensions.get('window');

interface RouteParams {
  bookId: string;
}

interface ExtendedBook extends Book {
  stock?: number;
  inStock?: boolean;
}

export function BookDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookId } = route.params as RouteParams;

  const [book, setBook] = useState<ExtendedBook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      const response = await api.get(`/allbooks/${bookId}`);
      setBook(response.data);
    } catch (error) {
      console.error('Error fetching book details:', error);
      Alert.alert('Error', 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    Alert.alert(
      'Purchase Request',
      `Thank you for your interest in "${book?.title}".\n\nOur team will contact you shortly to complete your purchase. May this sacred knowledge illuminate your path.`,
      [{ text: 'Hari Om', style: 'default' }]
    );
  };

  const isInStock = book?.inStock !== false && (book?.stock === undefined || book.stock > 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={styles.loadingText}>Loading book...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="book-alert" size={64} color={colors.text.secondary} />
        <Text style={styles.errorText}>Book not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.primary.maroon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Book Cover Section */}
        <View style={styles.coverSection}>
          <View style={styles.coverContainer}>
            {book.coverImage ? (
              <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
            ) : (
              <LinearGradient
                colors={[colors.gold.light, colors.gold.dark]}
                style={styles.coverPlaceholder}
              >
                <Icon name="book-open-variant" size={64} color={colors.primary.maroon} />
              </LinearGradient>
            )}
            {/* Temple frame decoration */}
            <View style={styles.coverFrame} />
          </View>
          {/* Stock Status */}
          <View
            style={[
              styles.stockBadge,
              !isInStock && styles.stockBadgeOutOfStock,
            ]}
          >
            <Icon
              name={isInStock ? 'check-circle' : 'close-circle'}
              size={14}
              color={colors.text.white}
            />
            <Text style={styles.stockText}>
              {isInStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>

        {/* Book Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>By {book.author}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>
              ₹{book.price.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Book Details Grid */}
          <View style={styles.detailsGrid}>
            {book.isbn && (
              <View style={styles.detailItem}>
                <Icon name="barcode" size={20} color={colors.gold.main} />
                <Text style={styles.detailLabel}>ISBN</Text>
                <Text style={styles.detailValue}>{book.isbn}</Text>
              </View>
            )}
            {book.pages && (
              <View style={styles.detailItem}>
                <Icon name="book-open-page-variant" size={20} color={colors.gold.main} />
                <Text style={styles.detailLabel}>Pages</Text>
                <Text style={styles.detailValue}>{book.pages}</Text>
              </View>
            )}
            {book.language && (
              <View style={styles.detailItem}>
                <Icon name="translate" size={20} color={colors.gold.main} />
                <Text style={styles.detailLabel}>Language</Text>
                <Text style={styles.detailValue}>{book.language}</Text>
              </View>
            )}
            {book.genre && (
              <View style={styles.detailItem}>
                <Icon name="tag" size={20} color={colors.gold.main} />
                <Text style={styles.detailLabel}>Genre</Text>
                <Text style={styles.detailValue}>{book.genre}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description Section */}
        {book.description && (
          <View style={styles.descriptionSection}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.goldAccent} />
              <Text style={styles.sectionTitle}>About This Book</Text>
            </View>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{book.description}</Text>
            </View>
          </View>
        )}

        {/* Spiritual Quote */}
        <View style={styles.quoteSection}>
          <Icon name="book-heart" size={28} color={colors.gold.main} />
          <Text style={styles.quoteText}>
            "Books are the carriers of civilization. Without books, history is silent."
          </Text>
        </View>
      </ScrollView>

      {/* Purchase Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.purchaseButton, !isInStock && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={!isInStock}
        >
          <LinearGradient
            colors={
              isInStock
                ? [colors.primary.saffron, colors.primary.vermillion]
                : [colors.text.secondary, colors.text.secondary]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.purchaseButtonGradient}
          >
            <Icon
              name={isInStock ? 'cart' : 'cart-off'}
              size={22}
              color={colors.text.white}
            />
            <Text style={styles.purchaseButtonText}>
              {isInStock ? 'Purchase Book' : 'Currently Unavailable'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.parchment,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.parchment,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 18,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.saffron,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.text.white,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.sandstone,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  coverSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.background.sandstone,
  },
  coverContainer: {
    position: 'relative',
    ...shadows.temple,
  },
  coverImage: {
    width: 180,
    height: 270,
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    width: 180,
    height: 270,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverFrame: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 3,
    borderColor: colors.gold.main,
    borderRadius: borderRadius.md + 4,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accent.peacock,
    borderRadius: borderRadius.full,
  },
  stockBadgeOutOfStock: {
    backgroundColor: colors.primary.deepRed,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.white,
  },
  infoCard: {
    margin: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.maroon,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  bookAuthor: {
    fontSize: 16,
    color: colors.gold.dark,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.gold as string,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary.saffron,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  detailItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.cream,
    borderRadius: borderRadius.md,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 2,
    textAlign: 'center',
  },
  descriptionSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goldAccent: {
    width: 4,
    height: 20,
    backgroundColor: colors.gold.main,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  descriptionCard: {
    padding: spacing.md,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold.main,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 24,
  },
  quoteSection: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background.cream,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  quoteText: {
    fontSize: 14,
    color: colors.text.primary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  buttonContainer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background.warmWhite,
    borderTopWidth: 1,
    borderTopColor: colors.border.gold as string,
    ...shadows.warm,
  },
  purchaseButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.white,
  },
});
