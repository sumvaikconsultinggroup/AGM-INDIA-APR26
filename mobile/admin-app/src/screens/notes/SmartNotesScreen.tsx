import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, FAB, Portal } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { SmartNote } from '../../types';
import { borderRadius, colors, spacing } from '../../theme';

const EMPTY_FORM = {
  title: '',
  body: '',
  tags: '',
  createTask: true,
  priority: 'medium',
  city: '',
};

export function SmartNotesScreen() {
  const { admin } = useAuth();
  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

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
        tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean),
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

  const updateAssignmentStatus = async (note: SmartNote, assignmentStatus: SmartNote['assignmentStatus']) => {
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

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Smart Notes</Text>
            <Text style={styles.subtitle}>Write operational notes naturally. If a team member is named, the note auto-assigns and can spawn a seva task.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noteTitle}>{item.title}</Text>
                  <Text style={styles.meta}>Created by {item.createdByName || 'Team'} • {new Date(item.createdAt).toLocaleString('en-IN')}</Text>
                </View>
                <Chip>{item.assignmentStatus || 'unassigned'}</Chip>
              </View>
              <Text style={styles.noteBody}>{item.body}</Text>
              {item.assignedToName ? <Text style={styles.assignment}>Assigned to: {item.assignedToName}</Text> : null}
              {item.mentionedMembers?.length ? (
                <View style={styles.chipWrap}>
                  {item.mentionedMembers.map((member, index) => (
                    <Chip key={`${member.name}-${index}`} compact>{member.name}</Chip>
                  ))}
                </View>
              ) : null}
              <View style={styles.actionRow}>
                <Button compact mode="outlined" onPress={() => updateAssignmentStatus(item, 'acknowledged')}>Acknowledge</Button>
                <Button compact mode="text" onPress={() => updateAssignmentStatus(item, 'completed')}>Complete</Button>
                <Button compact mode="text" textColor={colors.status.error} onPress={() => deleteNote(item)}>Delete</Button>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <Portal>
        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Smart Note</Text>
              <TextInput value={form.title} onChangeText={(value) => setForm((current) => ({ ...current, title: value }))} placeholder="Title" placeholderTextColor={colors.text.secondary} style={styles.input} />
              <TextInput value={form.body} onChangeText={(value) => setForm((current) => ({ ...current, body: value }))} placeholder="Example: Arvind said Swami ji wants a social media post on x, y, z. Raju should take this today." placeholderTextColor={colors.text.secondary} style={[styles.input, styles.multilineInput]} multiline />
              <TextInput value={form.tags} onChangeText={(value) => setForm((current) => ({ ...current, tags: value }))} placeholder="Tags, comma separated" placeholderTextColor={colors.text.secondary} style={styles.input} />
              <TextInput value={form.city} onChangeText={(value) => setForm((current) => ({ ...current, city: value }))} placeholder="Optional city context" placeholderTextColor={colors.text.secondary} style={styles.input} />
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Create linked seva task automatically</Text>
                  <Text style={styles.switchSubtitle}>If a team member is mentioned, we will auto-assign the note and create a task.</Text>
                </View>
                <Switch value={form.createTask} onValueChange={(value) => setForm((current) => ({ ...current, createTask: value }))} />
              </View>
              <View style={styles.modalActions}>
                <Button mode="outlined" onPress={() => setModalVisible(false)}>Cancel</Button>
                <Button mode="contained" onPress={saveNote} loading={saving}>Save Note</Button>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={() => setModalVisible(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.parchment },
  content: { padding: spacing.md, paddingBottom: 96 },
  header: { marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary.maroon },
  subtitle: { marginTop: spacing.xs, color: colors.text.secondary, lineHeight: 22 },
  card: { marginBottom: spacing.md, backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.lg },
  cardTopRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  noteTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  meta: { marginTop: 4, color: colors.text.secondary, fontSize: 12 },
  noteBody: { marginTop: spacing.sm, color: colors.text.primary, lineHeight: 22 },
  assignment: { marginTop: spacing.sm, color: colors.accent.peacock, fontWeight: '600' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background.warmWhite, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, maxHeight: '88%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.primary.maroon, marginBottom: spacing.md },
  input: { backgroundColor: colors.background.parchment, borderWidth: 1, borderColor: colors.border.gold as string, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text.primary, marginBottom: spacing.md },
  multilineInput: { minHeight: 120, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.md },
  switchTitle: { fontWeight: '700', color: colors.text.primary },
  switchSubtitle: { marginTop: 4, color: colors.text.secondary, lineHeight: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, backgroundColor: colors.primary.saffron },
});
