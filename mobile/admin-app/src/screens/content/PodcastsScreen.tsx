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
  Switch,
} from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../theme';
import api from '../../services/api';
import { pickImage } from '../../services/imageUpload';
import { Podcast } from '../../types';

type PodcastFormData = {
  title: string;
  description: string;
  videoUrl: string;
  category: string;
  date: string;
  duration: string;
  featured: boolean;
  coverImageUri: string | null;
};

const emptyForm: PodcastFormData = {
  title: '',
  description: '',
  videoUrl: '',
  category: '',
  date: '',
  duration: '',
  featured: false,
  coverImageUri: null,
};

export function PodcastsScreen() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [form, setForm] = useState<PodcastFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const fetchPodcasts = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/podcasts');
      const data = Array.isArray(response.data) ? response.data : [];
      setPodcasts(data.filter((p: Podcast) => !p.isDeleted));
    } catch (err) {
      setError('Failed to load podcasts');
      console.error('Error fetching podcasts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPodcasts();
  }, [fetchPodcasts]);

  const showSnackbar = (message: string) => {
    setSnackbar({ visible: true, message });
  };

  const openCreateModal = () => {
    setEditingPodcast(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEditModal = (podcast: Podcast) => {
    setEditingPodcast(podcast);
    setForm({
      title: podcast.title || '',
      description: podcast.description || '',
      videoUrl: podcast.videoUrl || '',
      category: podcast.category || '',
      date: podcast.date || '',
      duration: podcast.duration || '',
      featured: podcast.featured || false,
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
    fd.append('videoUrl', form.videoUrl);
    if (form.category) fd.append('category', form.category);
    if (form.date) fd.append('date', form.date);
    if (form.duration) fd.append('duration', form.duration);
    fd.append('featured', String(form.featured));
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
    if (!form.title.trim() || !form.videoUrl.trim()) {
      showSnackbar('Title and YouTube URL are required');
      return;
    }
    setSubmitting(true);
    try {
      const fd = buildFormData();
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingPodcast) {
        await api.put(`/podcasts/${editingPodcast._id}`, fd, config);
        showSnackbar('Podcast updated successfully');
      } else {
        await api.post('/podcasts', fd, config);
        showSnackbar('Podcast created successfully');
      }
      setModalVisible(false);
      fetchPodcasts();
    } catch (err) {
      console.error('Error saving podcast:', err);
      showSnackbar('Failed to save podcast');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (podcast: Podcast) => {
    Alert.alert(
      'Delete Podcast',
      `Are you sure you want to delete "${podcast.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/podcasts/${podcast._id}`);
              showSnackbar('Podcast deleted');
              fetchPodcasts();
            } catch (err) {
              console.error('Error deleting podcast:', err);
              showSnackbar('Failed to delete podcast');
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const renderPodcastCard = ({ item }: { item: Podcast }) => (
    <Card style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => openYouTube(item.videoUrl)}
      >
        <View style={styles.cardRow}>
          <View style={styles.coverContainer}>
            {item.coverImage ? (
              <Image
                source={{ uri: item.coverImage }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Text style={styles.placeholderIcon}>🎙️</Text>
              </View>
            )}
            {item.duration ? (
              <View style={styles.durationBadge}>
                <Text style={styles.durationBadgeText}>{item.duration}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.podcastInfo}>
            <Text style={styles.podcastTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.chipRow}>
              {item.category ? (
                <Chip
                  style={styles.categoryChip}
                  textStyle={styles.categoryChipText}
                  compact
                >
                  {item.category}
                </Chip>
              ) : null}
              {item.date ? (
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              ) : null}
            </View>
            {item.featured ? (
              <Chip
                style={styles.featuredChip}
                textStyle={styles.featuredChipText}
                icon="star"
                compact
              >
                Featured
              </Chip>
            ) : null}
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
        <IconButton
          icon="youtube"
          size={18}
          iconColor={colors.status.error}
          onPress={() => openYouTube(item.videoUrl)}
        />
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🎙️</Text>
      <Text style={styles.emptyStateText}>No podcasts available</Text>
      <Text style={styles.emptyStateSubtext}>
        Tap + to add your first podcast
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Podcasts</Text>
      <Text style={styles.headerSubtitle}>
        {podcasts.length} {podcasts.length === 1 ? 'episode' : 'episodes'} available
      </Text>
    </View>
  );

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
            {editingPodcast ? 'Edit Podcast' : 'Add Podcast'}
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
            ) : editingPodcast?.coverImage ? (
              <Image
                source={{ uri: editingPodcast.coverImage }}
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
            label="YouTube URL *"
            value={form.videoUrl}
            onChangeText={(v) => setForm((p) => ({ ...p, videoUrl: v }))}
            mode="outlined"
            keyboardType="url"
            autoCapitalize="none"
            style={styles.input}
            outlineColor={colors.border.gold}
            activeOutlineColor={colors.primary.saffron}
          />
          <View style={styles.row}>
            <TextInput
              label="Category"
              value={form.category}
              onChangeText={(v) => setForm((p) => ({ ...p, category: v }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              outlineColor={colors.border.gold}
              activeOutlineColor={colors.primary.saffron}
            />
            <TextInput
              label="Duration"
              value={form.duration}
              onChangeText={(v) => setForm((p) => ({ ...p, duration: v }))}
              mode="outlined"
              placeholder="e.g. 45:30"
              style={[styles.input, styles.halfInput]}
              outlineColor={colors.border.gold}
              activeOutlineColor={colors.primary.saffron}
            />
          </View>
          <TextInput
            label="Date (YYYY-MM-DD)"
            value={form.date}
            onChangeText={(v) => setForm((p) => ({ ...p, date: v }))}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border.gold}
            activeOutlineColor={colors.primary.saffron}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Featured</Text>
            <Switch
              value={form.featured}
              onValueChange={(v) => setForm((p) => ({ ...p, featured: v }))}
              color={colors.primary.saffron}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
            buttonColor={colors.primary.saffron}
            textColor={colors.text.white}
          >
            {editingPodcast ? 'Update Podcast' : 'Create Podcast'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={styles.loadingText}>Loading podcasts...</Text>
      </View>
    );
  }

  if (error && podcasts.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPodcasts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={podcasts}
        keyExtractor={(item) => item._id}
        renderItem={renderPodcastCard}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={podcasts.length > 0 ? renderHeader : null}
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
  header: {
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
  coverContainer: {
    width: 120,
    height: 100,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.sandstone,
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.accent.peacock,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationBadgeText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  podcastInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  podcastTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
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
  categoryChip: {
    backgroundColor: colors.accent.peacock,
    height: 24,
  },
  categoryChipText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  featuredChip: {
    backgroundColor: colors.gold.main,
    height: 24,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  featuredChipText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
  submitButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
  },
});
