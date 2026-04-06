import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Card, Chip, Modal, Portal, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import api from '../../services/api';
import { ContactMessage } from '../../types';
import { borderRadius, colors, spacing } from '../../theme';

type MessageFilter = 'all' | 'new' | 'in_review' | 'responded' | 'archived';

const FILTERS: MessageFilter[] = ['all', 'new', 'in_review', 'responded', 'archived'];

const STATUS_LABELS: Record<Exclude<MessageFilter, 'all'>, string> = {
  new: 'New',
  in_review: 'In Review',
  responded: 'Responded',
  archived: 'Archived',
};

const STATUS_COLORS: Record<Exclude<MessageFilter, 'all'>, string> = {
  new: colors.primary.saffron,
  in_review: colors.status.info,
  responded: colors.status.success,
  archived: colors.text.secondary,
};

export function MessagesScreen() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<MessageFilter>('all');
  const [internalNotes, setInternalNotes] = useState('');
  const [responseText, setResponseText] = useState('');
  const [assignedToName, setAssignedToName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await api.get('/connect');
      const data = Array.isArray(response.data) ? response.data : [];
      setMessages(data.filter((item: ContactMessage) => !item.isDeleted));
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load prayer requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (selectedMessage) {
      setInternalNotes(selectedMessage.internalNotes || '');
      setResponseText(selectedMessage.responseText || '');
      setAssignedToName(selectedMessage.assignedToName || '');
    }
  }, [selectedMessage]);

  const filteredMessages = useMemo(() => {
    if (filter === 'all') return messages;
    return messages.filter((message) => (message.status || 'new') === filter);
  }, [filter, messages]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMessages();
  }, [fetchMessages]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const persistMessage = async (status?: ContactMessage['status'], sendResponse?: boolean) => {
    if (!selectedMessage) return;
    try {
      setSaving(true);
      const response = await api.put(`/connect/${selectedMessage._id}`, {
        status: status || selectedMessage.status || 'new',
        internalNotes,
        responseText,
        assignedToName,
        sendResponse: Boolean(sendResponse && responseText.trim()),
      });

      const updated = response.data as ContactMessage;
      setMessages((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      setSelectedMessage(updated);

      if (sendResponse && responseText.trim()) {
        Alert.alert('Sent', 'Prayer response email has been sent.');
      } else {
        Alert.alert('Saved', 'Prayer request updated successfully.');
      }
    } catch (error) {
      console.error('Error updating prayer request:', error);
      Alert.alert('Error', 'Unable to update this prayer request right now.');
    } finally {
      setSaving(false);
    }
  };

  const archiveMessage = (message: ContactMessage) => {
    Alert.alert('Archive Request', `Archive ${message.fullName}'s request?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/connect/${message._id}`);
            setMessages((current) => current.filter((item) => item._id !== message._id));
            setSelectedMessage(null);
          } catch (error) {
            console.error('Error archiving prayer request:', error);
            Alert.alert('Error', 'Failed to archive the prayer request.');
          }
        },
      },
    ]);
  };

  const renderHeader = () => {
    const counts = FILTERS.reduce<Record<string, number>>((acc, key) => {
      acc[key] =
        key === 'all'
          ? messages.length
          : messages.filter((message) => (message.status || 'new') === key).length;
      return acc;
    }, {});

    return (
      <View style={styles.header}>
        <Text style={styles.title}>Prayer Requests</Text>
        <Text style={styles.subtitle}>Read, assign, and respond from mobile.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {FILTERS.map((item) => (
            <Chip
              key={item}
              selected={filter === item}
              onPress={() => setFilter(item)}
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              textStyle={[styles.filterChipText, filter === item && styles.filterChipTextActive]}
            >
              {item === 'all' ? `All (${counts[item]})` : `${STATUS_LABELS[item]} (${counts[item]})`}
            </Chip>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderItem = ({ item }: { item: ContactMessage }) => {
    const status = (item.status || 'new') as Exclude<MessageFilter, 'all'>;
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => setSelectedMessage(item)}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.fullName?.charAt(0)?.toUpperCase() || '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.metaText} numberOfLines={1}>{item.email}</Text>
                {item.subject ? <Text style={styles.subject}>{item.subject}</Text> : null}
              </View>
              <Chip
                compact
                style={[styles.statusChip, { backgroundColor: `${STATUS_COLORS[status]}20` }]}
                textStyle={[styles.statusChipText, { color: STATUS_COLORS[status] }]}
              >
                {STATUS_LABELS[status]}
              </Chip>
            </View>
            <Text style={styles.preview} numberOfLines={3}>{item.message}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
              {item.assignedToName ? <Text style={styles.assignee}>Assigned: {item.assignedToName}</Text> : null}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={styles.loadingText}>Loading prayer requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.saffron]}
            tintColor={colors.primary.saffron}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="hands-pray" size={48} color={colors.primary.saffron} />
            <Text style={styles.emptyTitle}>No prayer requests</Text>
            <Text style={styles.emptySubtitle}>Requests will appear here as devotees write in.</Text>
          </View>
        }
      />

      <Portal>
        <Modal
          visible={!!selectedMessage}
          onDismiss={() => setSelectedMessage(null)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedMessage && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selectedMessage.fullName}</Text>
              <Text style={styles.modalMeta}>{selectedMessage.email}</Text>
              {selectedMessage.phone ? <Text style={styles.modalMeta}>{selectedMessage.phone}</Text> : null}
              <Text style={styles.modalMeta}>{formatDate(selectedMessage.createdAt)}</Text>

              {selectedMessage.subject ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Subject</Text>
                  <Text style={styles.sectionValue}>{selectedMessage.subject}</Text>
                </View>
              ) : null}

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Prayer Request</Text>
                <Text style={styles.sectionValue}>{selectedMessage.message}</Text>
              </View>

              <View style={styles.inlineStatusRow}>
                {(['new', 'in_review', 'responded'] as const).map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.inlineStatusButton,
                      (selectedMessage.status || 'new') === item && { backgroundColor: STATUS_COLORS[item] },
                    ]}
                    onPress={() => persistMessage(item)}
                  >
                    <Text
                      style={[
                        styles.inlineStatusButtonText,
                        (selectedMessage.status || 'new') === item && { color: colors.text.white },
                      ]}
                    >
                      {STATUS_LABELS[item]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Assigned To</Text>
                <TextInput
                  value={assignedToName}
                  onChangeText={setAssignedToName}
                  placeholder="Enter team member name"
                  style={styles.input}
                  placeholderTextColor={colors.text.secondary}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Internal Notes</Text>
                <TextInput
                  value={internalNotes}
                  onChangeText={setInternalNotes}
                  placeholder="Add context, follow-up, or next step"
                  style={[styles.input, styles.multilineInput]}
                  multiline
                  placeholderTextColor={colors.text.secondary}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Response To Devotee</Text>
                <TextInput
                  value={responseText}
                  onChangeText={setResponseText}
                  placeholder="Type the reply that should go on email"
                  style={[styles.input, styles.multilineInput]}
                  multiline
                  placeholderTextColor={colors.text.secondary}
                />
              </View>

              <View style={styles.actionRow}>
                <Button mode="outlined" onPress={() => persistMessage(undefined, false)} disabled={saving}>
                  Save
                </Button>
                <Button mode="contained" onPress={() => persistMessage('responded', true)} loading={saving}>
                  Send Reply
                </Button>
              </View>

              <View style={styles.secondaryActions}>
                <Button mode="text" textColor={colors.text.secondary} onPress={() => setSelectedMessage(null)}>
                  Close
                </Button>
                <Button mode="text" textColor={colors.status.error} onPress={() => archiveMessage(selectedMessage)}>
                  Archive
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.parchment },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.parchment },
  loadingText: { marginTop: spacing.md, color: colors.text.secondary },
  listContent: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary.maroon },
  subtitle: { marginTop: spacing.xs, color: colors.text.secondary },
  filtersRow: { gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.xs },
  filterChip: { backgroundColor: colors.background.warmWhite, borderColor: colors.border.gold as string },
  filterChipActive: { backgroundColor: `${colors.primary.saffron}15` },
  filterChipText: { color: colors.text.secondary },
  filterChipTextActive: { color: colors.primary.saffron, fontWeight: '700' },
  card: { marginBottom: spacing.md, backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.lg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent.peacock, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.text.white, fontWeight: '700', fontSize: 18 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  metaText: { fontSize: 12, color: colors.text.secondary },
  subject: { marginTop: 2, color: colors.primary.maroon, fontWeight: '600' },
  preview: { color: colors.text.primary, lineHeight: 22 },
  cardFooter: { marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assignee: { fontSize: 12, color: colors.accent.peacock, fontWeight: '600' },
  statusChip: { alignSelf: 'flex-start' },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyTitle: { marginTop: spacing.md, fontSize: 18, fontWeight: '700', color: colors.primary.maroon },
  emptySubtitle: { marginTop: spacing.xs, color: colors.text.secondary, textAlign: 'center' },
  modalContainer: {
    backgroundColor: colors.background.warmWhite,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    maxHeight: '88%',
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.primary.maroon },
  modalMeta: { marginTop: 4, color: colors.text.secondary },
  section: { marginTop: spacing.lg },
  sectionLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.text.secondary, marginBottom: spacing.xs },
  sectionValue: { fontSize: 15, color: colors.text.primary, lineHeight: 23 },
  input: {
    backgroundColor: colors.background.parchment,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  multilineInput: { minHeight: 96, textAlignVertical: 'top' },
  inlineStatusRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, flexWrap: 'wrap' },
  inlineStatusButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.parchment,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  inlineStatusButtonText: { color: colors.text.secondary, fontWeight: '700' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, marginTop: spacing.xl },
  secondaryActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
});
