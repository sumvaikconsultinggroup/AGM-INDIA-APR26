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
} from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../theme';
import api from '../../services/api';
import { pickImage } from '../../services/imageUpload';
import { Book } from '../../types';

type BookFormData = {
  title: string;
  author: string;
  description: string;
  price: string;
  purchaseUrl: string;
  pages: string;
  language: string;
  genre: string;
  ISBN: string;
  publishedDate: string;
  coverImageUri: string | null;
};

const emptyForm: BookFormData = {
  title: '',
  author: '',
  description: '',
  price: '',
  purchaseUrl: '',
  pages: '',
  language: '',
  genre: '',
  ISBN: '',
  publishedDate: '',
  coverImageUri: null,
};

export function BooksScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const fetchBooks = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/allbooks');
      const data = Array.isArray(response.data) ? response.data : [];
      setBooks(data.filter((b: Book) => !b.isDeleted));
    } catch (err) {
      setError('Failed to load books');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBooks();
  }, [fetchBooks]);

  const showSnackbar = (message: string) => {
    setSnackbar({ visible: true, message });
  };

  const openCreateModal = () => {
    setEditingBook(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      price: book.price?.toString() || '',
      purchaseUrl: book.purchaseUrl || '',
      pages: book.pages?.toString() || '',
      language: book.language || '',
      genre: book.genre || '',
      ISBN: book.ISBN || '',
      publishedDate: book.publishedDate || '',
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
    const existingStock = editingBook?.stock;
    const stockIn = existingStock?.stockIn ?? 0;
    const soldOut = existingStock?.soldOut ?? 0;
    const available = existingStock?.available ?? Math.max(stockIn - soldOut, 0);

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('author', form.author);
    fd.append('description', form.description);
    fd.append('price', form.price);
    if (form.purchaseUrl) fd.append('purchaseUrl', form.purchaseUrl.trim());
    if (form.pages) fd.append('pages', form.pages);
    if (form.language) fd.append('language', form.language);
    if (form.genre) fd.append('genre', form.genre);
    if (form.ISBN) fd.append('ISBN', form.ISBN);
    if (form.publishedDate) fd.append('publishedDate', form.publishedDate);
    fd.append('stock[stockIn]', String(stockIn));
    fd.append('stock[soldOut]', String(soldOut));
    fd.append('stock[available]', String(available));
    fd.append('stock[lastUpdated]', new Date().toISOString());
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
    if (!form.title.trim() || !form.author.trim() || !form.price.trim()) {
      showSnackbar('Title, author, and price are required');
      return;
    }
    setSubmitting(true);
    try {
      const fd = buildFormData();
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingBook) {
        await api.put(`/allbooks/${editingBook._id}`, fd, config);
        showSnackbar('Book updated successfully');
      } else {
        await api.post('/allbooks', fd, config);
        showSnackbar('Book created successfully');
      }
      setModalVisible(false);
      fetchBooks();
    } catch (err) {
      console.error('Error saving book:', err);
      showSnackbar('Failed to save book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (book: Book) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/allbooks/${book._id}`);
              showSnackbar('Book deleted');
              fetchBooks();
            } catch (err) {
              console.error('Error deleting book:', err);
              showSnackbar('Failed to delete book');
            }
          },
        },
      ],
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStockStatus = (stock?: Book['stock']) => {
    if (!stock) return { label: 'Unknown', color: colors.text.secondary };
    if (stock.available <= 0) return { label: 'Sold Out', color: colors.status.error };
    if (stock.available < 10) return { label: 'Low Stock', color: colors.status.warning };
    return { label: 'In Stock', color: colors.status.success };
  };

  const renderBookCard = ({ item }: { item: Book }) => {
    const stockStatus = getStockStatus(item.stock);

    return (
      <Card style={styles.card}>
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
                <Text style={styles.placeholderIcon}>📚</Text>
              </View>
            )}
          </View>
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.authorText}>by {item.author || 'Unknown Author'}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
            </View>
            <View style={styles.chipRow}>
              {item.purchaseUrl ? (
                <Chip style={styles.linkChip} textStyle={styles.linkChipText} compact>
                  External Buy Link
                </Chip>
              ) : null}
              <Chip
                style={[styles.stockChip, { backgroundColor: stockStatus.color }]}
                textStyle={styles.stockChipText}
                compact
              >
                {stockStatus.label}
                {item.stock && item.stock.available > 0
                  ? ` (${item.stock.available})`
                  : ''}
              </Chip>
              {item.genre ? (
                <Chip
                  style={styles.genreChip}
                  textStyle={styles.genreChipText}
                  compact
                >
                  {item.genre}
                </Chip>
              ) : null}
            </View>
          </View>
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
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📖</Text>
      <Text style={styles.emptyStateText}>No books available</Text>
      <Text style={styles.emptyStateSubtext}>
        Tap + to add your first book
      </Text>
    </View>
  );

  const renderHeader = () => {
    const totalBooks = books.length;
    const inStock = books.filter((b) => (b.stock?.available || 0) > 0).length;
    const outOfStock = totalBooks - inStock;

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Book Inventory</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalBooks}</Text>
            <Text style={styles.summaryLabel}>Total Books</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{inStock}</Text>
            <Text style={styles.summaryLabel}>In Stock</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{outOfStock}</Text>
            <Text style={styles.summaryLabel}>Out of Stock</Text>
          </View>
        </View>
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
            {editingBook ? 'Edit Book' : 'Add Book'}
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
            ) : editingBook?.coverImage ? (
              <Image
                source={{ uri: editingBook.coverImage }}
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
            label="Author *"
            value={form.author}
            onChangeText={(v) => setForm((p) => ({ ...p, author: v }))}
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
            label="Price (INR) *"
            value={form.price}
            onChangeText={(v) => setForm((p) => ({ ...p, price: v }))}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            outlineColor={colors.border.gold}
            activeOutlineColor={colors.primary.saffron}
          />
          <TextInput
            label="Buy Link"
            value={form.purchaseUrl}
            onChangeText={(v) => setForm((p) => ({ ...p, purchaseUrl: v }))}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
            outlineColor={colors.border.gold}
            activeOutlineColor={colors.primary.saffron}
          />
          <Text style={styles.helperText}>
            Add the Amazon, publisher, or other marketplace URL. AvdheshanandG Mission will only display this external link and is not the seller.
          </Text>
          <View style={styles.row}>
            <TextInput
              label="Pages"
              value={form.pages}
              onChangeText={(v) => setForm((p) => ({ ...p, pages: v }))}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              outlineColor={colors.border.gold}
              activeOutlineColor={colors.primary.saffron}
            />
            <TextInput
              label="Language"
              value={form.language}
              onChangeText={(v) => setForm((p) => ({ ...p, language: v }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              outlineColor={colors.border.gold}
              activeOutlineColor={colors.primary.saffron}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              label="Genre"
              value={form.genre}
              onChangeText={(v) => setForm((p) => ({ ...p, genre: v }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              outlineColor={colors.border.gold}
              activeOutlineColor={colors.primary.saffron}
            />
            <TextInput
              label="ISBN"
              value={form.ISBN}
              onChangeText={(v) => setForm((p) => ({ ...p, ISBN: v }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              outlineColor={colors.border.gold}
              activeOutlineColor={colors.primary.saffron}
            />
          </View>
          <TextInput
            label="Published Date (YYYY-MM-DD)"
            value={form.publishedDate}
            onChangeText={(v) => setForm((p) => ({ ...p, publishedDate: v }))}
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
            {editingBook ? 'Update Book' : 'Create Book'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={styles.loadingText}>Loading books...</Text>
      </View>
    );
  }

  if (error && books.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBooks}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item._id}
        renderItem={renderBookCard}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={books.length > 0 ? renderHeader : null}
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
  summaryCard: {
    backgroundColor: colors.primary.maroon,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    color: colors.gold.light,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    color: colors.text.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: colors.gold.light,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    width: 100,
    height: 140,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.sandstone,
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gold.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
  },
  bookInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 22,
  },
  authorText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  priceRow: {
    marginTop: spacing.sm,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gold.dark,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  stockChip: {
    height: 24,
  },
  stockChipText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  genreChip: {
    backgroundColor: colors.accent.peacock,
    height: 24,
  },
  linkChip: {
    backgroundColor: colors.primary.vermillion,
    height: 24,
  },
  linkChipText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  genreChipText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  cardActions: {
    justifyContent: 'center',
    paddingRight: spacing.xs,
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
  helperText: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
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
  submitButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
  },
});
