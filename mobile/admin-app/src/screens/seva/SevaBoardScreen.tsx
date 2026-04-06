import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, FAB, Portal } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { SevaTask, Volunteer } from '../../types';
import { borderRadius, colors, spacing } from '../../theme';

interface TeamMember {
  _id: string;
  name: string;
  username: string;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  sevaType: 'other' as SevaTask['sevaType'],
  city: '',
  dueDate: '',
  shift: '',
  priority: 'medium' as SevaTask['priority'],
  assignedToType: 'team' as NonNullable<SevaTask['assignedToType']>,
  assignedToId: '',
  assignedToName: '',
};

export function SevaBoardScreen() {
  const { admin } = useAuth();
  const [tasks, setTasks] = useState<SevaTask[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<SevaTask | null>(null);
  const [statusFilter, setStatusFilter] = useState<SevaTask['status'] | 'all'>('all');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [taskRes, teamRes, volunteerRes] = await Promise.all([
        api.get('/seva-tasks'),
        api.get('/admin/team'),
        api.get('/volunteer?approved=true'),
      ]);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
      setTeam(Array.isArray(teamRes.data) ? teamRes.data : []);
      setVolunteers(Array.isArray(volunteerRes.data) ? volunteerRes.data : []);
    } catch (error) {
      console.error('Error fetching seva board data:', error);
      Alert.alert('Error', 'Failed to load seva board.');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const assigneeOptions = useMemo(() => {
    return form.assignedToType === 'team'
      ? team.map((member) => ({ id: member._id, label: member.name || member.username }))
      : volunteers.map((member) => ({ id: member._id, label: member.fullName }));
  }, [form.assignedToType, team, volunteers]);

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return tasks;
    return tasks.filter((task) => task.status === statusFilter);
  }, [statusFilter, tasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (task: SevaTask) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      sevaType: task.sevaType,
      city: task.city || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
      shift: task.shift || '',
      priority: task.priority,
      assignedToType: task.assignedToType || 'team',
      assignedToId: task.assignedToId || '',
      assignedToName: task.assignedToName || '',
    });
    setModalVisible(true);
  };

  const saveTask = async () => {
    if (!form.title.trim()) {
      Alert.alert('Title Required', 'Please add a seva title.');
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || undefined,
      status: form.assignedToId ? 'assigned' : 'open',
      createdById: admin?._id,
      createdByName: admin?.name || admin?.username,
    };

    try {
      setSaving(true);
      if (editingTask) {
        await api.put(`/seva-tasks/${editingTask._id}`, payload);
      } else {
        await api.post('/seva-tasks', payload);
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error saving seva task:', error);
      Alert.alert('Error', 'Unable to save seva task.');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (task: SevaTask, status: SevaTask['status']) => {
    try {
      await api.put(`/seva-tasks/${task._id}`, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating seva task status:', error);
      Alert.alert('Error', 'Unable to update task status.');
    }
  };

  const deleteTask = (task: SevaTask) => {
    Alert.alert('Delete Seva Task', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/seva-tasks/${task._id}`);
            fetchData();
          } catch (error) {
            console.error('Error deleting seva task:', error);
            Alert.alert('Error', 'Unable to delete task.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Seva Board</Text>
            <Text style={styles.subtitle}>Assign daily service tasks to team members or volunteers.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {(['all', 'open', 'assigned', 'in_progress', 'completed', 'blocked'] as const).map((item) => (
                <Chip key={item} selected={statusFilter === item} onPress={() => setStatusFilter(item as typeof statusFilter)}>
                  {item.replace('_', ' ')}
                </Chip>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.meta}>{item.assignedToName || 'Unassigned'} • {item.city || 'Any city'}</Text>
                </View>
                <Chip style={styles.statusChip}>{item.status.replace('_', ' ')}</Chip>
              </View>
              {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
              <View style={styles.metaRow}>
                <Text style={styles.meta}>Priority: {item.priority}</Text>
                {item.dueDate ? <Text style={styles.meta}>Due: {new Date(item.dueDate).toLocaleString('en-IN')}</Text> : null}
              </View>
              <View style={styles.actionRow}>
                <Button compact mode="outlined" onPress={() => openEditModal(item)}>Edit</Button>
                <Button compact mode="text" onPress={() => updateStatus(item, 'in_progress')}>Start</Button>
                <Button compact mode="text" onPress={() => updateStatus(item, 'completed')}>Done</Button>
                <Button compact mode="text" textColor={colors.status.error} onPress={() => deleteTask(item)}>Delete</Button>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <Portal>
        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingTask ? 'Edit Seva Task' : 'Create Seva Task'}</Text>
              <TextInput value={form.title} onChangeText={(value) => setForm((current) => ({ ...current, title: value }))} placeholder="Title" placeholderTextColor={colors.text.secondary} style={styles.input} />
              <TextInput value={form.description} onChangeText={(value) => setForm((current) => ({ ...current, description: value }))} placeholder="Description" placeholderTextColor={colors.text.secondary} style={[styles.input, styles.multilineInput]} multiline />
              <TextInput value={form.city} onChangeText={(value) => setForm((current) => ({ ...current, city: value }))} placeholder="City" placeholderTextColor={colors.text.secondary} style={styles.input} />
              <TextInput value={form.shift} onChangeText={(value) => setForm((current) => ({ ...current, shift: value }))} placeholder="Shift / time window" placeholderTextColor={colors.text.secondary} style={styles.input} />
              <TextInput value={form.dueDate} onChangeText={(value) => setForm((current) => ({ ...current, dueDate: value }))} placeholder="Due date YYYY-MM-DDTHH:mm" placeholderTextColor={colors.text.secondary} style={styles.input} />

              <Text style={styles.sectionLabel}>Assign To</Text>
              <View style={styles.toggleRow}>
                {(['team', 'volunteer'] as const).map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.toggleButton, form.assignedToType === item && styles.toggleButtonActive]}
                    onPress={() => setForm((current) => ({ ...current, assignedToType: item, assignedToId: '', assignedToName: '' }))}
                  >
                    <Text style={[styles.toggleText, form.assignedToType === item && styles.toggleTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.assigneeWrap}>
                {assigneeOptions.slice(0, 12).map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.assigneeChip, form.assignedToId === option.id && styles.assigneeChipActive]}
                    onPress={() => setForm((current) => ({ ...current, assignedToId: option.id, assignedToName: option.label }))}
                  >
                    <Text style={[styles.assigneeChipText, form.assignedToId === option.id && styles.assigneeChipTextActive]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button mode="outlined" onPress={() => setModalVisible(false)}>Cancel</Button>
                <Button mode="contained" onPress={saveTask} loading={saving}>Save</Button>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={openCreateModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.parchment },
  content: { padding: spacing.md, paddingBottom: 96 },
  header: { marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary.maroon },
  subtitle: { marginTop: spacing.xs, color: colors.text.secondary },
  filterRow: { gap: spacing.sm, paddingTop: spacing.md },
  card: { marginBottom: spacing.md, backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.lg },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  meta: { color: colors.text.secondary, marginTop: 4 },
  description: { marginTop: spacing.sm, color: colors.text.primary, lineHeight: 22 },
  metaRow: { marginTop: spacing.sm, gap: 2 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  statusChip: { backgroundColor: `${colors.primary.saffron}15` },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background.warmWhite, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, maxHeight: '88%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.primary.maroon, marginBottom: spacing.md },
  input: { backgroundColor: colors.background.parchment, borderWidth: 1, borderColor: colors.border.gold as string, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text.primary, marginBottom: spacing.md },
  multilineInput: { minHeight: 90, textAlignVertical: 'top' },
  sectionLabel: { fontSize: 12, color: colors.text.secondary, textTransform: 'uppercase', marginBottom: spacing.sm },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  toggleButton: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border.gold as string, borderRadius: borderRadius.full },
  toggleButtonActive: { backgroundColor: `${colors.primary.saffron}15`, borderColor: colors.primary.saffron },
  toggleText: { color: colors.text.secondary, fontWeight: '600' },
  toggleTextActive: { color: colors.primary.saffron },
  assigneeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  assigneeChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.background.parchment, borderWidth: 1, borderColor: colors.border.gold as string },
  assigneeChipActive: { backgroundColor: `${colors.primary.saffron}15`, borderColor: colors.primary.saffron },
  assigneeChipText: { color: colors.text.secondary, fontSize: 12, fontWeight: '600' },
  assigneeChipTextActive: { color: colors.primary.saffron },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, backgroundColor: colors.primary.saffron },
});
