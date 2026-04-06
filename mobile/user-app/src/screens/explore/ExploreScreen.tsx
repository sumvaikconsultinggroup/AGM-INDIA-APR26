import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');
const GALLERY_ITEM_WIDTH = (width - spacing.lg * 2 - spacing.sm) / 2;

type Category = 'Articles' | 'Videos' | 'Books' | 'Podcasts' | 'Gallery';
type LocalizedText = Record<string, string | undefined>;

interface Article {
  _id: string;
  title: string;
  titleTranslations?: LocalizedText;
  description?: string;
  descriptionTranslations?: LocalizedText;
  category?: string;
  categoryTranslations?: LocalizedText;
  publishedDate: string;
  coverImage?: string;
  link?: string;
  readTime?: number;
}

interface Video {
  _id: string;
  title: string;
  titleTranslations?: LocalizedText;
  description?: string;
  descriptionTranslations?: LocalizedText;
  thumbnail?: string;
}

interface Book {
  _id: string;
  title: string;
  titleTranslations?: LocalizedText;
  author?: string;
  price?: number;
  coverImage?: string;
}

interface Podcast {
  _id: string;
  title: string;
  titleTranslations?: LocalizedText;
  description?: string;
  descriptionTranslations?: LocalizedText;
  duration?: string;
  coverImage?: string;
  videoUrl?: string;
}

interface GalleryItem {
  _id: string;
  image: string;
  title?: string;
  titleTranslations?: LocalizedText;
}

const categories: { key: Category; icon: 'file-document' | 'video' | 'book-open-variant' | 'podcast' | 'image-multiple' }[] = [
  { key: 'Articles', icon: 'file-document' },
  { key: 'Videos', icon: 'video' },
  { key: 'Books', icon: 'book-open-variant' },
  { key: 'Podcasts', icon: 'podcast' },
  { key: 'Gallery', icon: 'image-multiple' },
];

const apiEndpoints: Record<Category, string> = {
  Articles: '/articles',
  Videos: '/videoseries',
  Books: '/allbooks',
  Podcasts: '/podcasts',
  Gallery: '/glimpse',
};

export function ExploreScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const initialCategory = route.params?.category || 'Articles';
  
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dateLocale = useCallback(() => {
    const language = i18n.language?.split('-')[0] || 'en';
    const localeMap: Record<string, string> = {
      hi: 'hi-IN',
      bn: 'bn-BD',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      pa: 'pa-IN',
      or: 'or-IN',
      as: 'as-IN',
      en: 'en-IN',
    };
    return localeMap[language] || 'en-IN';
  }, [i18n.language]);

  const categoryLabels: Record<Category, string> = {
    Articles: t('explore.articles'),
    Videos: t('explore.videos'),
    Books: t('explore.books'),
    Podcasts: t('explore.podcasts'),
    Gallery: t('explore.gallery'),
  };

  const resolveLocalizedText = useCallback(
    (localized?: LocalizedText, fallback?: string) => {
      const language = i18n.language?.split('-')[0] || 'en';
      return localized?.[language] || localized?.en || localized?.hi || fallback || '';
    },
    [i18n.language]
  );

  useEffect(() => {
    const routeCategory = route.params?.category;
    if (
      routeCategory &&
      categories.some((category) => category.key === routeCategory) &&
      routeCategory !== selectedCategory
    ) {
      setSelectedCategory(routeCategory);
    }
  }, [route.params?.category, selectedCategory]);

  const fetchData = useCallback(async () => {
    try {
      const endpoint = apiEndpoints[selectedCategory];
      const response = await api.get(`${endpoint}?lang=${encodeURIComponent(i18n.language || 'en')}`);
      const items = response.data || [];
      setData(items);
      setFilteredData(items);
    } catch (error) {
      console.error(`Error fetching ${selectedCategory}:`, error);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, [i18n.language, selectedCategory]);

  useEffect(() => {
    setLoading(true);
    setSearchQuery('');
    fetchData();
  }, [selectedCategory, fetchData]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(data);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = data.filter((item) => {
        const title = resolveLocalizedText(item.titleTranslations, item.title || item.eventName || '');
        const description =
          resolveLocalizedText(item.descriptionTranslations, item.description || item.excerpt || '');
        const author = item.author || '';
        return (
          title.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query) ||
          author.toLowerCase().includes(query)
        );
      });
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(dateLocale(), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderArticleItem = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigation.navigate('ArticleDetail', { articleId: item._id })}
    >
      <View style={styles.itemImageContainer}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.itemImage} />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Icon name="file-document" size={24} color={colors.gold.main} />
          </View>
        )}
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {resolveLocalizedText(item.titleTranslations, item.title)}
        </Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {resolveLocalizedText(item.descriptionTranslations, item.description || '')}
        </Text>
        <View style={styles.itemMeta}>
        {(item.category || item.categoryTranslations) && (
            <Text style={styles.itemMetaText}>
              {resolveLocalizedText(item.categoryTranslations, item.category)}
            </Text>
          )}
          <Text style={styles.itemDate}>{formatDate(item.publishedDate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderVideoItem = ({ item }: { item: Video }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => navigation.navigate('VideoSeries', { seriesId: item._id })}
    >
      <View style={styles.itemImageContainer}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.itemImage} />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Icon name="video" size={24} color={colors.gold.main} />
          </View>
        )}
        <View style={styles.playButton}>
          <Icon name="play" size={16} color={colors.text.white} />
        </View>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {resolveLocalizedText(item.titleTranslations, item.title)}
        </Text>
        <Text style={styles.itemDescription} numberOfLines={3}>
          {resolveLocalizedText(item.descriptionTranslations, item.description) || t('explore.videoSeriesFallback')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => navigation.navigate('BookDetail', { bookId: item._id })}
    >
      <View style={styles.bookImageContainer}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.bookImage} />
        ) : (
          <View style={styles.bookImagePlaceholder}>
            <Icon name="book-open-variant" size={32} color={colors.gold.main} />
          </View>
        )}
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {resolveLocalizedText(item.titleTranslations, item.title)}
        </Text>
        {item.author && (
          <Text style={styles.itemDescription}>
            {t('explore.byAuthor', { author: item.author })}
          </Text>
        )}
        {item.price !== undefined && (
          <Text style={styles.bookPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPodcastItem = ({ item }: { item: Podcast }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigation.navigate('PodcastDetail', { podcastId: item._id })}
    >
      <View style={styles.podcastIcon}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={{ width: 56, height: 56, borderRadius: 28 }} />
        ) : (
          <Icon name="podcast" size={28} color={colors.primary.saffron} />
        )}
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {resolveLocalizedText(item.titleTranslations, item.title)}
        </Text>
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {resolveLocalizedText(item.descriptionTranslations, item.description)}
          </Text>
        )}
        {item.duration && (
          <View style={styles.durationBadge}>
            <Icon name="clock-outline" size={12} color={colors.text.secondary} />
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        )}
      </View>
      <Icon name="play-circle" size={32} color={colors.primary.saffron} />
    </TouchableOpacity>
  );

  const renderGalleryItem = ({ item }: { item: GalleryItem }) => (
    <TouchableOpacity 
      style={styles.galleryItem}
      onPress={() => navigation.navigate('GalleryFull')}
    >
      <Image source={{ uri: item.image }} style={styles.galleryImage} />
      {(item.title || item.titleTranslations) && (
        <Text style={styles.galleryTitle} numberOfLines={1}>
          {resolveLocalizedText(item.titleTranslations, item.title)}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => {
    switch (selectedCategory) {
      case 'Articles':
        return renderArticleItem({ item });
      case 'Videos':
        return renderVideoItem({ item });
      case 'Books':
        return renderBookItem({ item });
      case 'Podcasts':
        return renderPodcastItem({ item });
      case 'Gallery':
        return renderGalleryItem({ item });
      default:
        return null;
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon
        name={categories.find((c) => c.key === selectedCategory)?.icon || 'alert'}
        size={48}
        color={colors.text.secondary}
      />
      <Text style={styles.emptyTitle}>
        {t('explore.noItemsTitle', { category: categoryLabels[selectedCategory] })}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? t('explore.searchTryDifferent')
          : t('explore.checkBackLater')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategory === item.key && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(item.key)}
            >
              <Icon
                name={item.icon}
                size={18}
                color={
                  selectedCategory === item.key
                    ? colors.text.white
                    : colors.text.primary
                }
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.key && styles.categoryTextActive,
                ]}
              >
                {categoryLabels[item.key]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('explore.searchPlaceholder', {
              category: categoryLabels[selectedCategory].toLowerCase(),
            })}
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.saffron} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={selectedCategory === 'Gallery' ? 2 : 1}
          key={selectedCategory === 'Gallery' ? 'gallery' : 'list'}
          contentContainerStyle={[
            styles.listContainer,
            selectedCategory === 'Gallery' && styles.galleryContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary.saffron]}
              tintColor={colors.primary.saffron}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  categoryContainer: {
    backgroundColor: colors.background.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  categoryList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.sandstone,
  },
  categoryTabActive: {
    backgroundColor: colors.primary.saffron,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  categoryTextActive: {
    color: colors.text.white,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.background.warmWhite,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.parchment,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: spacing.md,
  },
  galleryContainer: {
    paddingHorizontal: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.md,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.sandstone,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.saffron,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookImageContainer: {
    width: 70,
    height: 100,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  bookImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.sandstone,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podcastIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  itemDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  itemMetaText: {
    fontSize: 12,
    color: colors.gold.dark,
    fontWeight: '500',
  },
  itemDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  bookPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.maroon,
    marginTop: spacing.xs,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  durationText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  galleryItem: {
    width: GALLERY_ITEM_WIDTH,
    marginRight: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background.warmWhite,
    ...shadows.warm,
  },
  galleryImage: {
    width: '100%',
    height: GALLERY_ITEM_WIDTH,
    resizeMode: 'cover',
  },
  galleryTitle: {
    fontSize: 12,
    color: colors.text.primary,
    padding: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
