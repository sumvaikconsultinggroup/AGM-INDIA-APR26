import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Card,
  ActivityIndicator,
  Portal,
  Modal,
  Button,
} from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../theme';
import api from '../../services/api';
import { ContactMessage } from '../../types';

export function MessagesScreen() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/connect');
      const data = Array.isArray(response.data) ? response.data : [];
      setMessages(data.filter((m: ContactMessage) => !m.isDeleted));
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMessages();
  }, [fetchMessages]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) {
        return date.toLocaleDateString('en-IN', { weekday: 'short' });
      }
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: diffDays > 365 ? 'numeric' : undefined,
      });
    } catch {
      return dateString;
    }
  };

  const formatFullDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getMessagePreview = (message: string, maxLength: number = 80) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength).trim() + '...';
  };

  const handleDelete = (msg: ContactMessage) => {
    Alert.alert(
      'Delete Message',
      `Delete message from "${msg.fullName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/connect/${msg._id}`);
              if (selectedMessage?._id === msg._id) {
                setSelectedMessage(null);
              }
              fetchMessages();
            } catch (err) {
              console.error('Error deleting message:', err);
              Alert.alert('Error', 'Failed to delete message.');
            }
          },
        },
      ],
    );
  };

  const renderMessageCard = ({ item }: { item: ContactMessage }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setSelectedMessage(item)}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {item.fullName?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.messageInfo}>
              <Text style={styles.senderName} numberOfLines={1}>
                {item.fullName}
              </Text>
              <Text style={styles.senderEmail} numberOfLines={1}>
                {item.email}
              </Text>
            </View>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>

          {item.subject ? (
            <Text style={styles.subjectText} numberOfLines={1}>
              {item.subject}
            </Text>
          ) : null}

          <View style={styles.messageSection}>
            <Text style={styles.messagePreview} numberOfLines={2}>
              {getMessagePreview(item.message)}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💬</Text>
      <Text style={styles.emptyStateText}>No messages yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Contact messages will appear here
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Messages</Text>
      <Text style={styles.headerSubtitle}>
        {messages.length} {messages.length === 1 ? 'message' : 'messages'}
      </Text>
    </View>
  );

  const renderDetailModal = () => {
    if (!selectedMessage) return null;
    const msg = selectedMessage;

    return (
      <Portal>
        <Modal
          visible={!!selectedMessage}
          onDismiss={() => setSelectedMessage(null)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <View style={styles.avatarContainerLarge}>
                <Text style={styles.avatarTextLarge}>
                  {msg.fullName?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={styles.modalName}>{msg.fullName}</Text>
              <Text style={styles.modalEmail}>{msg.email}</Text>
              <Text style={styles.modalDate}>{formatFullDate(msg.createdAt)}</Text>
            </View>

            {msg.subject ? (
              <View style={styles.modalField}>
                <Text style={styles.modalFieldLabel}>Subject</Text>
                <Text style={styles.modalSubject}>{msg.subject}</Text>
              </View>
            ) : null}

            <View style={styles.modalField}>
              <Text style={styles.modalFieldLabel}>Message</Text>
              <Text style={styles.modalMessage}>{msg.message}</Text>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setSelectedMessage(null)}
                style={styles.closeBtn}
                textColor={colors.text.secondary}
              >
                Close
              </Button>
              <Button
                mode="contained"
                onPress={() => handleDelete(msg)}
                buttonColor={colors.status.error}
              >
                Delete
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  if (error && messages.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMessages}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessageCard}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={messages.length > 0 ? renderHeader : null}
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

      {renderDetailModal()}
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
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent.peacock,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarContainerLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent.peacock,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarTextLarge: {
    color: colors.text.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  messageInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  senderEmail: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.maroon,
    marginBottom: spacing.sm,
  },
  messageSection: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.gold as string,
  },
  messagePreview: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  deleteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.status.error,
  },
  deleteBtnText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    backgroundColor: colors.background.warmWhite,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  modalEmail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  modalDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  modalField: {
    marginBottom: spacing.md,
  },
  modalFieldLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  modalSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.maroon,
  },
  modalMessage: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.gold as string,
  },
  closeBtn: {
    borderColor: colors.text.secondary,
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
});
