import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import {
  Card,
  FAB,
  ActivityIndicator,
  IconButton,
  TextInput,
  Button,
  Dialog,
  Portal,
  Chip,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius } from '../../theme';
import api from '../../services/api';
import { Article, LocalizedText } from '../../types';

const CONTENT_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'bn', label: 'Bangla' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'mr', label: 'Marathi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'or', label: 'Odia' },
  { code: 'as', label: 'Assamese' },
] as const;

const createEmptyLocalizedText = (): LocalizedText =>
  CONTENT_LANGUAGES.reduce<LocalizedText>((acc, { code }) => {
    acc[code] = '';
    return acc;
  }, {});

const normalizeLocalizedText = (localized: LocalizedText): LocalizedText =>
  CONTENT_LANGUAGES.reduce<LocalizedText>((acc, { code }) => {
    const value = localized[code]?.trim();
    if (value) acc[code] = value;
    return acc;
  }, {});

const getPrimaryLocalizedValue = (localized?: LocalizedText, fallback = '') =>
  localized?.en?.trim() ||
  localized?.hi?.trim() ||
  Object.values(localized || {}).find((value) => value?.trim()) ||
  fallback;

interface ArticleFormData {
  titleTranslations: LocalizedText;
  descriptionTranslations: LocalizedText;
  categoryTranslations: LocalizedText;
  link: string;
  readTime: string;
  publishedDate: string;
  imageUri: string | null;
  imageName: string | null;
}

const emptyForm: ArticleFormData = {
  titleTranslations: createEmptyLocalizedText(),
  descriptionTranslations: createEmptyLocalizedText(),
  categoryTranslations: createEmptyLocalizedText(),
  link: '',
  readTime: '',
  publishedDate: '',
  imageUri: null,
  imageName: null,
};

export function ArticlesScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [form, setForm] = useState<ArticleFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchArticles = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/articles');
      const data = response.data?.articles || response.data || [];
      setArticles(data.filter((a: Article) => !a.isDeleted));
    } catch (err) {
      setError('Failed to load articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchArticles();
  }, [fetchArticles]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getExcerpt = (text: string, maxLength: number = 120) => {
    if (!text) return '';
    const plain = text.replace(/<[^>]*>/g, '');
    if (plain.length <= maxLength) return plain;
    return plain.substring(0, maxLength).trim() + '...';
  };

  const isValidIsoDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  };

  // ── Image Picker ──

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileName = asset.uri.split('/').pop() || 'cover_image.jpg';
      setForm((prev) => ({ ...prev, imageUri: asset.uri, imageName: fileName }));
    }
  };

  // ── Create / Edit ──

  const openCreateModal = () => {
    setEditingArticle(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEditModal = (article: Article) => {
    setEditingArticle(article);
    setForm({
      titleTranslations: {
        ...createEmptyLocalizedText(),
        ...(article.titleTranslations || {}),
        en: article.titleTranslations?.en || article.title || '',
      },
      descriptionTranslations: {
        ...createEmptyLocalizedText(),
        ...(article.descriptionTranslations || {}),
        en: article.descriptionTranslations?.en || article.description || '',
      },
      categoryTranslations: {
        ...createEmptyLocalizedText(),
        ...(article.categoryTranslations || {}),
        en: article.categoryTranslations?.en || article.category || '',
      },
      link: article.link || '',
      readTime: article.readTime != null ? String(article.readTime) : '',
      publishedDate: article.publishedDate ? article.publishedDate.split('T')[0] : '',
      imageUri: article.coverImage || null,
      imageName: null,
    });
    setModalVisible(true);
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append('title', getPrimaryLocalizedValue(form.titleTranslations));
    fd.append('description', getPrimaryLocalizedValue(form.descriptionTranslations));
    fd.append('category', getPrimaryLocalizedValue(form.categoryTranslations));
    fd.append('titleTranslations', JSON.stringify(normalizeLocalizedText(form.titleTranslations)));
    fd.append(
      'descriptionTranslations',
      JSON.stringify(normalizeLocalizedText(form.descriptionTranslations))
    );
    fd.append(
      'categoryTranslations',
      JSON.stringify(normalizeLocalizedText(form.categoryTranslations))
    );
    fd.append('link', form.link);
    fd.append('readTime', form.readTime);
    fd.append('publishedDate', form.publishedDate);

    if (form.imageUri && form.imageName) {
      const ext = form.imageName.split('.').pop()?.toLowerCase() || 'jpeg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      fd.append('coverImage', {
        uri: form.imageUri,
        name: form.imageName,
        type: mimeType,
      } as unknown as Blob);
    }

    return fd;
  };

  const handleSubmit = async () => {
    if (!getPrimaryLocalizedValue(form.titleTranslations).trim()) {
      Alert.alert('Validation', 'Title is required.');
      return;
    }
    if (!getPrimaryLocalizedValue(form.descriptionTranslations).trim()) {
      Alert.alert('Validation', 'Description is required.');
      return;
    }
    if (form.publishedDate && !isValidIsoDate(form.publishedDate.trim())) {
      Alert.alert('Validation', 'Published date must be in YYYY-MM-DD format.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = buildFormData();
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editingArticle) {
        await api.put(`/articles/${editingArticle._id}`, fd, config);
      } else {
        await api.post('/articles', fd, config);
      }

      setModalVisible(false);
      setForm(emptyForm);
      setEditingArticle(null);
      fetchArticles();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', msg);
      console.error('Article submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──

  const confirmDelete = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogVisible(true);
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/articles/${articleToDelete._id}`);
      setDeleteDialogVisible(false);
      setArticleToDelete(null);
      fetchArticles();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to delete article.';
      Alert.alert('Error', msg);
      console.error('Article delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ──

  const renderArticleCard = ({ item }: { item: Article }) => (
    <TouchableOpacity
      onPress={() => openEditModal(item)}
      onLongPress={() => confirmDelete(item)}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        {item.coverImage ? (
          <Image
            source={{ uri: item.coverImage }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : null}
        <Card.Content style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.articleTitle} numberOfLines={2}>
              {getPrimaryLocalizedValue(item.titleTranslations, item.title)}
            </Text>
            <View style={styles.cardActions}>
              <IconButton
                icon="pencil"
                iconColor={colors.accent.peacock}
                size={18}
                onPress={() => openEditModal(item)}
              />
              <IconButton
                icon="delete"
                iconColor={colors.status.error}
                size={18}
                onPress={() => confirmDelete(item)}
              />
            </View>
          </View>

          <Text style={styles.excerpt} numberOfLines={3}>
            {getExcerpt(getPrimaryLocalizedValue(item.descriptionTranslations, item.description))}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaLeft}>
              {item.category || item.categoryTranslations ? (
                <Chip
                  style={styles.categoryChip}
                  textStyle={styles.categoryChipText}
                  compact
                >
                  {getPrimaryLocalizedValue(item.categoryTranslations, item.category)}
                </Chip>
              ) : null}
              {item.readTime != null ? (
                <Text style={styles.readTime}>{item.readTime} min read</Text>
              ) : null}
            </View>
            <Text style={styles.dateText}>{formatDate(item.publishedDate)}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No articles yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Create your first article using the + button
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={styles.loadingText}>Loading articles...</Text>
      </View>
    );
  }

  if (error && articles.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchArticles}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={(item) => item._id}
        renderItem={renderArticleCard}
        contentContainerStyle={styles.listContent}
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
        onPress={openCreateModal}
        color={colors.text.white}
      />

      {/* ── Create / Edit Modal ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingArticle ? 'Edit Article' : 'Create Article'}
              </Text>
              <IconButton
                icon="close"
                iconColor={colors.text.primary}
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>

            <ScrollView
              style={styles.formScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.translationSectionTitle}>Localized Titles</Text>
              {CONTENT_LANGUAGES.map(({ code, label }) => (
                <TextInput
                  key={`title-${code}`}
                  label={`Title (${label})${code === 'en' ? ' *' : ''}`}
                  value={form.titleTranslations[code] || ''}
                  onChangeText={(v) =>
                    setForm((p) => ({
                      ...p,
                      titleTranslations: { ...p.titleTranslations, [code]: v },
                    }))
                  }
                  mode="outlined"
                  style={styles.input}
                  outlineColor={colors.border.gold}
                  activeOutlineColor={colors.primary.saffron}
                />
              ))}

              <Text style={styles.translationSectionTitle}>Localized Descriptions</Text>
              {CONTENT_LANGUAGES.map(({ code, label }) => (
                <TextInput
                  key={`description-${code}`}
                  label={`Description (${label})${code === 'en' ? ' *' : ''}`}
                  value={form.descriptionTranslations[code] || ''}
                  onChangeText={(v) =>
                    setForm((p) => ({
                      ...p,
                      descriptionTranslations: { ...p.descriptionTranslations, [code]: v },
                    }))
                  }
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.multilineInput]}
                  outlineColor={colors.border.gold}
                  activeOutlineColor={colors.primary.saffron}
                />
              ))}

              <Text style={styles.translationSectionTitle}>Localized Categories</Text>
              {CONTENT_LANGUAGES.map(({ code, label }) => (
                <TextInput
                  key={`category-${code}`}
                  label={`Category (${label})`}
                  value={form.categoryTranslations[code] || ''}
                  onChangeText={(v) =>
                    setForm((p) => ({
                      ...p,
                      categoryTranslations: { ...p.categoryTranslations, [code]: v },
                    }))
                  }
                  mode="outlined"
                  style={styles.input}
                  outlineColor={colors.border.gold}
                  activeOutlineColor={colors.primary.saffron}
                />
              ))}

              <TextInput
                label="Link"
                value={form.link}
                onChangeText={(v) => setForm((p) => ({ ...p, link: v }))}
                mode="outlined"
                keyboardType="url"
                autoCapitalize="none"
                style={styles.input}
                outlineColor={colors.border.gold}
                activeOutlineColor={colors.primary.saffron}
              />

              <TextInput
                label="Read Time (minutes)"
                value={form.readTime}
                onChangeText={(v) => setForm((p) => ({ ...p, readTime: v }))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                outlineColor={colors.border.gold}
                activeOutlineColor={colors.primary.saffron}
              />

              <TextInput
                label="Published Date"
                value={form.publishedDate}
                onChangeText={(v) => setForm((p) => ({ ...p, publishedDate: v }))}
                placeholder="YYYY-MM-DD"
                mode="outlined"
                style={styles.input}
                outlineColor={colors.border.gold}
                activeOutlineColor={colors.primary.saffron}
              />

              {/* Image picker */}
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {form.imageUri ? (
                  <Image
                    source={{ uri: form.imageUri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <IconButton icon="camera-plus" iconColor={colors.text.secondary} size={32} />
                    <Text style={styles.imagePlaceholderText}>Tap to select a cover image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.formActions}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                  textColor={colors.text.secondary}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={submitting}
                  style={styles.submitButton}
                  buttonColor={colors.primary.saffron}
                  textColor={colors.text.white}
                >
                  {editingArticle ? 'Update' : 'Create'}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Delete Confirmation Dialog ── */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Article</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete "{articleToDelete?.title}"? This action cannot be
              undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)} textColor={colors.text.secondary}>
              Cancel
            </Button>
            <Button
              onPress={handleDelete}
              loading={deleting}
              disabled={deleting}
              textColor={colors.status.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
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
    paddingBottom: 100,
  },
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.md,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.background.sandstone,
  },
  cardContent: {
    paddingTop: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  articleTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  cardActions: {
    flexDirection: 'row',
    marginLeft: spacing.xs,
    marginTop: -spacing.xs,
  },
  excerpt: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.gold,
    paddingTop: spacing.md,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.accent.peacock,
    height: 28,
  },
  categoryChipText: {
    color: colors.text.white,
    fontSize: 11,
  },
  readTime: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  dateText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
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
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.warmWhite,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold,
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary.maroon,
  },
  formScroll: {
    flexGrow: 0,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.background.warmWhite,
  },
  translationSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary.maroon,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  multilineInput: {
    minHeight: 120,
  },

  // Image picker
  imagePicker: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderStyle: 'dashed',
  },
  imagePreview: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.sandstone,
  },
  imagePlaceholderText: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: -spacing.sm,
  },

  // Form actions
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  cancelButton: {
    borderColor: colors.border.gold,
  },
  submitButton: {
    minWidth: 100,
  },
});
