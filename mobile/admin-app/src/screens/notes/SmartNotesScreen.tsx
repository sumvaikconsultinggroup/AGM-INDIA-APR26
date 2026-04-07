import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, FAB, Portal } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { SmartNote } from '../../types';
import {
  AdminEmptyState,
  AdminHero,
  AdminMetricCard,
  AdminPill,
  AdminSectionHeader,
  AdminSurface,
} from '../../components/common';
import { borderRadius, colors, spacing, typography } from '../../theme';

type FilterKey = 'all' | 'open' | 'auto_assigned' | 'acknowledged' | 'completed';

const EMPTY_FORM = {
  title: '',
  body: '',
  tags: '',
  createTask: true,
  priority: 'medium',
  city: '',
};

const FILTERS: FilterKey[] = ['all', 'open', 'auto_assigned', 'acknowledged', 'completed'];

export function SmartNotesScreen() {
  const { admin } = useAuth();
  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const fetchNotes = useCallback(async () => {
    try {
      const response = await api.get('/smart-notes');
      setNotes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching smart notes:', error);
      Alert.alert('Error', 'Failed to load smart notes.');
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const saveNote = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      Alert.alert('Missing Details', 'Please add both a title and note body.');
      return;
    }

    try {
      setSaving(true);
      await api.post('/smart-notes', {
        title: form.title.trim(),
        body: form.body.trim(),
        tags: form.tags
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        createTask: form.createTask,
        priority: form.priority,
        city: form.city.trim() || undefined,
        createdById: admin?._id,
        createdByName: admin?.name || admin?.username,
      });
      setModalVisible(false);
      setForm(EMPTY_FORM);
      fetchNotes();
      Alert.alert('Saved', 'Smart note created. Mentioned team members were auto-detected.');
    } catch (error) {
      console.error('Error saving smart note:', error);
      Alert.alert('Error', 'Failed to save smart note.');
    } finally {
      setSaving(false);
    }
  };

  const updateAssignmentStatus = async (
    note: SmartNote,
    assignmentStatus: SmartNote['assignmentStatus'],
  ) => {
    try {
      await api.put(`/smart-notes/${note._id}`, { assignmentStatus });
      fetchNotes();
    } catch (error) {
      console.error('Error updating smart note:', error);
      Alert.alert('Error', 'Failed to update smart note.');
    }
  };

  const deleteNote = async (note: SmartNote) => {
    try {
      await api.delete(`/smart-notes/${note._id}`);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting smart note:', error);
      Alert.alert('Error', 'Failed to delete smart note.');
    }
  };

  const counts = useMemo(() => {
    const completed = notes.filter((note) => note.assignmentStatus === 'completed').length;
    const acknowledged = notes.filter((note) => note.assignmentStatus === 'acknowledged').length;
    const autoAssigned = notes.filter((note) => note.assignmentStatus === 'auto_assigned').length;
    return {
      all: notes.length,
      open: notes.length - completed,
      auto_assigned: autoAssigned,
      acknowledged,
      completed,
    };
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (activeFilter === 'all') return notes;
    if (activeFilter === 'open') {
      return notes.filter((note) => note.assignmentStatus !== 'completed');
    }
    return notes.filter((note) => note.assignmentStatus === activeFilter);
  }, [activeFilter, notes]);

  const statusTone = (status?: SmartNote['assignmentStatus']) => {
    switch (status) {
      case 'completed':
        return colors.status.success;
      case 'acknowledged':
        return colors.accent.peacock;
      case 'auto_assigned':
        return colors.primary.saffron;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <AdminHero
              eyebrow="Operational memory"
              title="Smart Notes"
              subtitle="Write naturally. Mentioned team members get picked up, assigned, and tracked for follow-through."
              actions={[{ label: 'New note', icon: 'plus', onPress: () => setModalVisible(true) }]}
            />

            <View style={styles.metricGrid}>
              <AdminMetricCard label="Open notes" value={counts.open} icon="note-multiple-outline" />
              <AdminMetricCard
                label="Auto-assigned"
                value={counts.auto_assigned}
                icon="account-check-outline"
                tone={colors.primary.saffron}
              />
              <AdminMetricCard
                label="Acknowledged"
                value={counts.acknowledged}
                icon="progress-check"
                tone={colors.accent.peacock}
              />
              <AdminMetricCard
                label="Completed"
                value={counts.completed}
                icon="check-decagram-outline"
                tone={colors.status.success}
              />
            </View>

            <AdminSectionHeader
              title="Active notes"
              subtitle="Filter by workflow state and keep execution moving."
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {FILTERS.map((filter) => (
                <AdminPill
                  key={filter}
                  label={`${filter.replace('_', ' ')} (${counts[filter]})`}
                  selected={filter === activeFilter}
                  onPress={() => setActiveFilter(filter)}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <AdminEmptyState
            icon="note-outline"
            title="No smart notes yet"
            message="Once notes are created, assignments and linked seva actions will appear here."
            actionLabel="Create note"
            onAction={() => setModalVisible(true)}
          />
        }
        renderItem={({ item }) => (
          <AdminSurface style={styles.noteCard}>
            <View style={styles.noteTopRow}>
              <View style={styles.noteCopy}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteMeta}>
                  {item.createdByName || 'Team'} • {new Date(item.createdAt).toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${statusTone(item.assignmentStatus)}18` }]}>
                <Text style={[styles.statusText, { color: statusTone(item.assignmentStatus) }]}>
                  {item.assignmentStatus || 'unassigned'}
                </Text>
              </View>
            </View>

            <Text style={styles.noteBody}>{item.body}</Text>

            {item.assignedToName ? (
              <View style={styles.assignmentRow}>
                <Icon name="account-arrow-right-outline" size={16} color={colors.accent.peacock} />
                <Text style={styles.assignmentText}>Assigned to {item.assignedToName}</Text>
              </View>
            ) : null}

            {item.mentionedMembers?.length ? (
              <View style={styles.chipWrap}>
                {item.mentionedMembers.map((member, index) => (
                  <View key={`${member.name}-${index}`} style={styles.memberChip}>
                    <Text style={styles.memberChipText}>{member.name}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => updateAssignmentStatus(item, 'acknowledged')}
              >
                <Icon name="check-circle-outline" size={16} color={colors.accent.peacock} />
                <Text style={styles.actionText}>Acknowledge</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => updateAssignmentStatus(item, 'completed')}
              >
                <Icon name="check-decagram-outline" size={16} color={colors.status.success} />
                <Text style={styles.actionText}>Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => deleteNote(item)}>
                <Icon name="delete-outline" size={16} color={colors.status.error} />
                <Text style={[styles.actionText, { color: colors.status.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </AdminSurface>
        )}
      />

      <Portal>
        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Create Smart Note</Text>
                <Text style={styles.modalSubtitle}>
                  Mention a team member by name and we’ll try to auto-assign the work.
                </Text>
                <TextInput
                  value={form.title}
                  onChangeText={(value) => setForm((current) => ({ ...current, title: value }))}
                  placeholder="Title"
                  placeholderTextColor={colors.text.secondary}
                  style={styles.input}
                />
                <TextInput
                  value={form.body}
                  onChangeText={(value) => setForm((current) => ({ ...current, body: value }))}
                  placeholder="Example: Arvind said Swami ji wants a social media post on x, y, z. Raju should take this today."
                  placeholderTextColor={colors.text.secondary}
                  style={[styles.input, styles.multilineInput]}
                  multiline
                />
                <TextInput
                  value={form.tags}
                  onChangeText={(value) => setForm((current) => ({ ...current, tags: value }))}
                  placeholder="Tags, comma separated"
                  placeholderTextColor={colors.text.secondary}
                  style={styles.input}
                />
                <TextInput
                  value={form.city}
                  onChangeText={(value) => setForm((current) => ({ ...current, city: value }))}
                  placeholder="Optional city context"
                  placeholderTextColor={colors.text.secondary}
                  style={styles.input}
                />
                <AdminSurface style={styles.switchCard}>
                  <View style={styles.switchRow}>
                    <View style={styles.switchCopy}>
                      <Text style={styles.switchTitle}>Create linked seva task</Text>
                      <Text style={styles.switchSubtitle}>
                        If a member is detected, create a trackable task automatically.
                      </Text>
                    </View>
                    <Switch
                      value={form.createTask}
                      onValueChange={(value) => setForm((current) => ({ ...current, createTask: value }))}
                    />
                  </View>
                </AdminSurface>
                <View style={styles.modalActions}>
                  <Button mode="outlined" onPress={() => setModalVisible(false)}>
                    Cancel
                  </Button>
                  <Button mode="contained" onPress={saveNote} loading={saving}>
                    Save Note
                  </Button>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={() => setModalVisible(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 96,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  filterRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    marginBottom: spacing.sm,
  },
  noteCard: {
    marginBottom: spacing.md,
  },
  noteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  noteCopy: {
    flex: 1,
  },
  noteTitle: {
    ...typography.title,
    color: colors.text.primary,
  },
  noteMeta: {
    ...typography.bodySm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...typography.micro,
  },
  noteBody: {
    ...typography.body,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  assignmentText: {
    ...typography.label,
    color: colors.accent.peacock,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  memberChip: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: `${colors.primary.saffron}14`,
  },
  memberChipText: {
    ...typography.micro,
    color: colors.primary.saffron,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.parchment,
  },
  actionText: {
    ...typography.label,
    color: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 8, 2, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.warmWhite,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '88%',
  },
  modalTitle: {
    ...typography.titleLg,
    color: colors.primary.maroon,
  },
  modalSubtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.background.parchment,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  switchCard: {
    marginTop: spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  switchCopy: {
    flex: 1,
  },
  switchTitle: {
    ...typography.titleSm,
    color: colors.text.primary,
  },
  switchSubtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary.saffron,
  },
});
