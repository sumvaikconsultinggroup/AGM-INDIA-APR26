import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {
  Card,
  ActivityIndicator,
  Chip,
  FAB,
  TextInput,
  Button,
  IconButton,
  Portal,
  Snackbar,
} from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../theme';
import api from '../../services/api';
import { pickImage } from '../../services/imageUpload';
import { VideoSeries } from '../../types';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SeriesFormData = {
  title: string;
  description: string;
  category: string;
  coverImageUri: string | null;
};

const emptyForm: SeriesFormData = {
  title: '',
  description: '',
  category: '',
  coverImageUri: null,
};

export function VideosScreen() {
  const [series, setSeries] = useState<VideoSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSeries, setEditingSeries] = useState<VideoSeries | null>(null);
  const [form, setForm] = useState<SeriesFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const fetchVideoSeries = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/videoseries');
      const data = Array.isArray(response.data) ? response.data : [];
      setSeries(data);
    } catch (err) {
      setError('Failed to load video series');
      console.error('Error fetching video series:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVideoSeries();
  }, [fetchVideoSeries]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVideoSeries();
  }, [fetchVideoSeries]);

  const showSnackbar = (message: string) => {
    setSnackbar({ visible: true, message });
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const openCreateModal = () => {
    setEditingSeries(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEditModal = (s: VideoSeries) => {
    setEditingSeries(s);
    setForm({
      title: s.title || '',
      description: s.description || '',
      category: s.category || '',
      coverImageUri: null,
    });
    setModalVisible(true);
  };

  const handlePickImage = async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        setForm((prev) => ({ ...prev, coverImageUri: uri }));
      }
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to pick image');
    }
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    if (form.category) fd.append('category', form.category);
    if (form.coverImageUri) {
      const filename = form.coverImageUri.split('/').pop() || 'cover.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      fd.append('coverImage', {
        uri: form.coverImageUri,
        name: filename,
        type,
      } as any);
    }
    return fd;
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showSnackbar('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      const fd = buildFormData();
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingSeries) {
        await api.put(`/videoseries/${editingSeries._id}`, fd, config);
        showSnackbar('Series updated successfully');
      } else {
        await api.post('/videoseries', fd, config);
        showSnackbar('Series created successfully');
      }
      setModalVisible(false);
      fetchVideoSeries();
    } catch (err) {
      console.error('Error saving series:', err);
      showSnackbar('Failed to save series');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (s: VideoSeries) => {
    Alert.alert(
      'Delete Series',
      `Are you sure you want to delete "${s.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/videoseries/${s._id}`);
              showSnackbar('Series deleted');
              fetchVideoSeries();
            } catch (err) {
              console.error('Error deleting series:', err);
              showSnackbar('Failed to delete series');
            }
          },
        },
      ],
    );
  };

  const openYouTube = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        showSnackbar('Could not open YouTube link');
      });
    }
  };

  const formatViews = (views?: number) => {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return String(views);
  };

  const renderVideoItem = (video: NonNullable<VideoSeries['videos']>[number]) => (
    <TouchableOpacity
      key={video.videoId}
      style={styles.videoItem}
      activeOpacity={0.7}
      onPress={() => openYouTube(video.youtubeUrl)}
    >
      <View style={styles.videoThumbContainer}>
        {video.coverImage ? (
          <Image
            source={{ uri: video.coverImage }}
            style={styles.videoThumb}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.videoThumbPlaceholder}>
            <Text style={styles.videoThumbIcon}>▶</Text>
          </View>
        )}
        {video.duration ? (
          <View style={styles.videoDurationBadge}>
            <Text style={styles.videoDurationText}>{video.duration}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.videoDetails}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title}
        </Text>
        {video.description ? (
          <Text style={styles.videoDescription} numberOfLines={1}>
            {video.description}
          </Text>
        ) : null}
        <View style={styles.videoMeta}>
          {video.views !== undefined ? (
            <Text style={styles.videoMetaText}>
              {formatViews(video.views)} views
            </Text>
          ) : null}
          {video.likes !== undefined ? (
            <Text style={styles.videoMetaText}>
              {formatViews(video.likes)} likes
            </Text>
          ) : null}
          {video.publishedAt ? (
            <Text style={styles.videoMetaText}>
              {new Date(video.publishedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSeriesCard = ({ item }: { item: VideoSeries }) => {
    const videoCount = item.videoCount || item.videos?.length || 0;
    const isExpanded = expandedId === item._id;

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleExpand(item._id)}
        >
          <View style={styles.cardRow}>
            <View style={styles.thumbnailContainer}>
              {item.coverImage ? (
                <Image
                  source={{ uri: item.coverImage }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Text style={styles.placeholderIcon}>🎬</Text>
                </View>
              )}
              <View style={styles.countOverlay}>
                <Text style={styles.countOverlayText}>{videoCount}</Text>
              </View>
            </View>
            <View style={styles.contentSection}>
              <Text style={styles.seriesTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.description ? (
                <Text style={styles.seriesDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <View style={styles.chipRow}>
                <Chip
                  style={styles.countChip}
                  textStyle={styles.countChipText}
                  icon="video"
                  compact
                >
                  {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                </Chip>
                {item.category ? (
                  <Chip
                    style={styles.categoryChip}
                    textStyle={styles.categoryChipText}
                    compact
                  >
                    {item.category}
                  </Chip>
                ) : null}
              </View>
            </View>
            <View style={styles.expandIcon}>
              <IconButton
                icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                iconColor={colors.text.secondary}
              />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <IconButton
            icon="pencil"
            size={18}
            iconColor={colors.accent.peacock}
            onPress={() => openEditModal(item)}
          />
          <IconButton
            icon="delete"
            size={18}
            iconColor={colors.status.error}
            onPress={() => handleDelete(item)}
          />
        </View>

        {isExpanded && item.videos && item.videos.length > 0 ? (
          <View style={styles.videosContainer}>
            <View style={styles.videosDivider} />
            {item.videos.map(renderVideoItem)}
          </View>
        ) : null}

        {isExpanded && (!item.videos || item.videos.length === 0) ? (
          <View style={styles.noVideos}>
            <Text style={styles.noVideosText}>No videos in this series</Text>
          </View>
        ) : null}
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🎥</Text>
      <Text style={styles.emptyStateText}>No video series</Text>
      <Text style={styles.emptyStateSubtext}>
        Tap + to create your first series
      </Text>
    </View>
  );

  const renderHeader = () => {
    const totalSeries = series.length;
    const totalVideos = series.reduce(
      (sum, s) => sum + (s.videoCount || s.videos?.length || 0),
      0,
    );

    return (
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Video Series</Text>
        <Text style={styles.headerSubtitle}>
          {totalSeries} {totalSeries === 1 ? 'series' : 'series'} ·{' '}
          {totalVideos} total videos
        </Text>
      </View>
    );
  };

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setModalVisible(false)}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingSeries ? 'Edit Series' : 'Add Series'}
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={() => setModalVisible(false)}
          />
        </View>
        <ScrollView
          style={styles.modalBody}
          contentContainerStyle={styles.modalBodyContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {form.coverImageUri ? (
              <Image
                source={{ uri: form.coverImageUri }}
                style={styles.imagePickerPreview}
              />
            ) : editingSeries?.coverImage ? (
              <Image
                source={{ uri: editingSeries.coverImage }}
                style={styles.imagePickerPreview}
              />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <Text style={styles.imagePickerText}>Tap to pick cover image</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            label="Title *"
            value={form.title}
            onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border.gold}
            activeOutlineColor={colors.primary.saffron}
          />
          <TextInput
            label="Description"
            value={form.description}
            onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            outlineColor={colors.border.gold}
            activeOutlineColor={colors.primary.saffron}
          />
          <TextInput
            label="Category"
            value={form.category}
            onChangeText={(v) => setForm((p) => ({ ...p, category: v }))}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border.gold}
            activeOutlineColor={colors.primary.saffron}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
            buttonColor={colors.primary.saffron}
            textColor={colors.text.white}
          >
            {editingSeries ? 'Update Series' : 'Create Series'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={styles.loadingText}>Loading video series...</Text>
      </View>
    );
  }

  if (error && series.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchVideoSeries}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={series}
        keyExtractor={(item) => item._id}
        renderItem={renderSeriesCard}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={series.length > 0 ? renderHeader : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.saffron]}
            tintColor={colors.primary.saffron}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        color={colors.text.white}
        onPress={openCreateModal}
      />
      {renderModal()}
      <Portal>
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ visible: false, message: '' })}
          duration={3000}
          action={{ label: 'OK', onPress: () => {} }}
        >
          {snackbar.message}
        </Snackbar>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.parchment,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
    fontSize: 16,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary.saffron,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.text.white,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  headerCard: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.maroon,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.md,
    elevation: 3,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
  },
  thumbnailContainer: {
    width: 120,
    height: 90,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.sandstone,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary.maroon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  countOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countOverlayText: {
    color: colors.text.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  contentSection: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  seriesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  seriesDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  countChip: {
    backgroundColor: colors.accent.peacock,
    height: 24,
  },
  countChipText: {
    color: colors.text.white,
    fontSize: 10,
  },
  categoryChip: {
    backgroundColor: colors.gold.main,
    height: 24,
  },
  categoryChipText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  expandIcon: {
    justifyContent: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.sm,
  },
  videosContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  videosDivider: {
    height: 1,
    backgroundColor: colors.border.gold,
    marginBottom: spacing.md,
  },
  videoItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  videoThumbContainer: {
    width: 100,
    height: 60,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumb: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.sandstone,
  },
  videoThumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary.maroon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoThumbIcon: {
    color: colors.text.white,
    fontSize: 18,
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  videoDurationText: {
    color: colors.text.white,
    fontSize: 9,
    fontWeight: '600',
  },
  videoDetails: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 18,
  },
  videoDescription: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  videoMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  videoMetaText: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  noVideos: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  noVideosText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    color: colors.text.secondary,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary.saffron,
    borderRadius: borderRadius.full,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold,
    backgroundColor: colors.background.warmWhite,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary.maroon,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  imagePicker: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderStyle: 'dashed',
  },
  imagePickerPreview: {
    width: '100%',
    height: '100%',
  },
  imagePickerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.sandstone,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  input: {
    marginBottom: spacing.sm,
    backgroundColor: colors.background.warmWhite,
  },
  submitButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
  },
});
