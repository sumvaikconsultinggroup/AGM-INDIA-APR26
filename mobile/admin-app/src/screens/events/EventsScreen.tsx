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
  Platform,
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
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius } from '../../theme';
import api from '../../services/api';
import { Event } from '../../types';

interface EventFormData {
  eventName: string;
  eventDate: string;
  eventLocation: string;
  description: string;
  imageUri: string | null;
  imageName: string | null;
}

const emptyForm: EventFormData = {
  eventName: '',
  eventDate: '',
  eventLocation: '',
  description: '',
  imageUri: null,
  imageName: null,
};

export function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/events');
      const data = response.data?.events || response.data || [];
      setEvents(data.filter((e: Event) => !e.isDeleted));
    } catch (err) {
      setError('Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
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
      const fileName = asset.uri.split('/').pop() || 'event_image.jpg';
      setForm((prev) => ({ ...prev, imageUri: asset.uri, imageName: fileName }));
    }
  };

  // ── Create / Edit ──

  const openCreateModal = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setForm({
      eventName: event.eventName,
      eventDate: event.eventDate ? event.eventDate.split('T')[0] : '',
      eventLocation: event.eventLocation,
      description: event.description || '',
      imageUri: event.eventImage || null,
      imageName: null,
    });
    setModalVisible(true);
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append('eventName', form.eventName);
    fd.append('eventDate', form.eventDate);
    fd.append('eventLocation', form.eventLocation);
    fd.append('description', form.description);

    if (form.imageUri && form.imageName) {
      const ext = form.imageName.split('.').pop()?.toLowerCase() || 'jpeg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      fd.append('eventImage', {
        uri: form.imageUri,
        name: form.imageName,
        type: mimeType,
      } as unknown as Blob);
    }

    return fd;
  };

  const handleSubmit = async () => {
    if (!form.eventName.trim()) {
      Alert.alert('Validation', 'Event name is required.');
      return;
    }
    if (!form.eventDate.trim()) {
      Alert.alert('Validation', 'Event date is required.');
      return;
    }
    if (!isValidIsoDate(form.eventDate.trim())) {
      Alert.alert('Validation', 'Event date must be in YYYY-MM-DD format.');
      return;
    }
    if (!form.eventLocation.trim()) {
      Alert.alert('Validation', 'Event location is required.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = buildFormData();
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      let updatedEvent: Event | null = null;
      if (editingEvent) {
        const res = await api.put(`/events/${editingEvent._id}`, fd, config);
        updatedEvent = res.data;
        // Update local state immediately so the UI reflects changes
        if (updatedEvent) {
          setEvents(prev => prev.map(e => e._id === editingEvent._id ? { ...e, ...updatedEvent } : e));
        }
        Alert.alert('Success', 'Event updated successfully');
      } else {
        await api.post('/events', fd, config);
        Alert.alert('Success', 'Event created successfully');
      }

      setModalVisible(false);
      setForm(emptyForm);
      setEditingEvent(null);
      // Re-fetch to ensure server state is in sync
      setTimeout(() => fetchEvents(), 500);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', `${msg}${status ? ` (${status})` : ''}`);
      console.error('Event submit error:', JSON.stringify(err?.response?.data || err?.message));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──

  const confirmDelete = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogVisible(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${eventToDelete._id}`);
      setDeleteDialogVisible(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to delete event.';
      Alert.alert('Error', msg);
      console.error('Event delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ──

  const renderEventCard = ({ item }: { item: Event }) => {
    const eventDate = new Date(item.eventDate);
    return (
      <TouchableOpacity
        onPress={() => openEditModal(item)}
        onLongPress={() => confirmDelete(item)}
        activeOpacity={0.7}
      >
        <Card style={styles.card}>
          {item.eventImage ? (
            <Image
              source={{ uri: item.eventImage }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : null}
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
                <Text style={styles.dateMonth}>
                  {eventDate.toLocaleString('en', { month: 'short' })}
                </Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventName} numberOfLines={1}>
                  {item.eventName}
                </Text>
                <View style={styles.eventMeta}>
                  <Text style={styles.metaText}>
                    {String.fromCodePoint(0x1f4cd)} {item.eventLocation || 'TBA'}
                  </Text>
                </View>
                <View style={styles.eventMeta}>
                  <Text style={styles.metaText}>
                    {String.fromCodePoint(0x1f465)} {item.registeredUsers?.length || 0} registered
                  </Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <IconButton
                  icon="pencil"
                  iconColor={colors.accent.peacock}
                  size={20}
                  onPress={() => openEditModal(item)}
                />
                <IconButton
                  icon="delete"
                  iconColor={colors.status.error}
                  size={20}
                  onPress={() => confirmDelete(item)}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No events available</Text>
      <Text style={styles.emptyStateSubtext}>
        Create your first event using the + button
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  if (error && events.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={renderEventCard}
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
                {editingEvent ? 'Edit Event' : 'Create Event'}
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
              <TextInput
                label="Event Name *"
                value={form.eventName}
                onChangeText={(v) => setForm((p) => ({ ...p, eventName: v }))}
                mode="outlined"
                style={styles.input}
                outlineColor={colors.border.gold}
                activeOutlineColor={colors.primary.saffron}
              />

              <TextInput
                label="Event Date *"
                value={form.eventDate}
                onChangeText={(v) => setForm((p) => ({ ...p, eventDate: v }))}
                placeholder="YYYY-MM-DD"
                mode="outlined"
                style={styles.input}
                outlineColor={colors.border.gold}
                activeOutlineColor={colors.primary.saffron}
              />

              <TextInput
                label="Event Location *"
                value={form.eventLocation}
                onChangeText={(v) => setForm((p) => ({ ...p, eventLocation: v }))}
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
                numberOfLines={4}
                style={[styles.input, styles.multilineInput]}
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
                    <Text style={styles.imagePlaceholderText}>Tap to select an image</Text>
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
                  {editingEvent ? 'Update' : 'Create'}
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
          <Dialog.Title>Delete Event</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete "{eventToDelete?.eventName}"? This action cannot be
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
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.saffron,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 150,
    backgroundColor: colors.background.sandstone,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dateBox: {
    width: 56,
    height: 56,
    backgroundColor: colors.primary.saffron,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dateDay: {
    color: colors.text.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  dateMonth: {
    color: colors.text.white,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyState: {
    padding: spacing.xl,
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
  multilineInput: {
    minHeight: 100,
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
