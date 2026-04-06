import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Modal, Portal } from 'react-native-paper';
import api from '../../services/api';
import { MantraDikshaRegistration } from '../../types';
import { borderRadius, colors, spacing } from '../../theme';

type ReviewFilter = 'all' | 'pending' | 'under_review' | 'approved' | 'rejected';

const STATUS_COLORS: Record<Exclude<ReviewFilter, 'all'>, string> = {
  pending: colors.primary.saffron,
  under_review: colors.status.info,
  approved: colors.status.success,
  rejected: colors.status.error,
};

export function MantraDikshaScreen() {
  const [registrations, setRegistrations] = useState<MantraDikshaRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [selected, setSelected] = useState<MantraDikshaRegistration | null>(null);
  const [notes, setNotes] = useState('');
  const [assignedToName, setAssignedToName] = useState('');
  const [ceremonyDate, setCeremonyDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    try {
      const response = await api.get('/mantra-diksha');
      const data = Array.isArray(response.data) ? response.data : [];
      setRegistrations(data.filter((item: MantraDikshaRegistration) => !item.isDeleted));
    } catch (error) {
      console.error('Error fetching mantra diksha registrations:', error);
      Alert.alert('Error', 'Failed to load mantra diksha registrations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  useEffect(() => {
    if (selected) {
      setNotes(selected.internalNotes || '');
      setAssignedToName(selected.assignedToName || '');
      setCeremonyDate(selected.ceremonyDate ? new Date(selected.ceremonyDate).toISOString().slice(0, 16) : '');
    }
  }, [selected]);

  const filtered = useMemo(() => {
    if (filter === 'all') return registrations;
    return registrations.filter((item) => (item.status || 'pending') === filter);
  }, [filter, registrations]);

  const persist = async (status?: MantraDikshaRegistration['status']) => {
    if (!selected) return;
    try {
      setSaving(true);
      const response = await api.put(`/mantra-diksha/${selected._id}`, {
        status: status || selected.status || 'pending',
        internalNotes: notes,
        assignedToName,
        ceremonyDate: ceremonyDate || undefined,
        notifyApplicant: status === 'approved' || status === 'rejected',
      });
      const updated = response.data as MantraDikshaRegistration;
      setRegistrations((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      setSelected(updated);
      Alert.alert('Updated', 'Registration workflow updated successfully.');
    } catch (error) {
      console.error('Error updating mantra diksha registration:', error);
      Alert.alert('Error', 'Failed to update registration.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: MantraDikshaRegistration }) => {
    const status = (item.status || 'pending') as Exclude<ReviewFilter, 'all'>;
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => setSelected(item)}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.meta}>{item.mobileNumber}</Text>
                <Text style={styles.meta}>{item.nationality}</Text>
              </View>
              <Chip style={[styles.statusChip, { backgroundColor: `${STATUS_COLORS[status]}20` }]} textStyle={{ color: STATUS_COLORS[status], fontWeight: '700' }}>
                {status.replace('_', ' ')}
              </Chip>
            </View>
            <Text style={styles.intent} numberOfLines={2}>{item.spiritualIntent || 'Awaiting review notes from the team.'}</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRegistrations(); }} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Mantra Diksha</Text>
            <Text style={styles.subtitle}>Review, assign, and approve registrations from mobile.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {(['all', 'pending', 'under_review', 'approved', 'rejected'] as ReviewFilter[]).map((item) => (
                <Chip key={item} selected={filter === item} onPress={() => setFilter(item)} style={styles.filterChip}>
                  {item === 'all' ? 'All' : item.replace('_', ' ')}
                </Chip>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={renderItem}
      />

      <Portal>
        <Modal visible={!!selected} onDismiss={() => setSelected(null)} contentContainerStyle={styles.modalContainer}>
          {selected && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selected.fullName}</Text>
              <Text style={styles.meta}>{selected.email || 'No email provided'}</Text>
              <Text style={styles.meta}>{selected.mobileNumber}</Text>
              <Text style={styles.meta}>{selected.nationality}</Text>

              <View style={styles.section}>
                <Text style={styles.label}>Spiritual Intent</Text>
                <Text style={styles.value}>{selected.spiritualIntent || 'Not shared'}</Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.label}>Assigned To</Text>
                <TextInput value={assignedToName} onChangeText={setAssignedToName} placeholder="Reviewer / sevak name" placeholderTextColor={colors.text.secondary} style={styles.input} />
              </View>
              <View style={styles.section}>
                <Text style={styles.label}>Ceremony Date</Text>
                <TextInput value={ceremonyDate} onChangeText={setCeremonyDate} placeholder="YYYY-MM-DDTHH:mm" placeholderTextColor={colors.text.secondary} style={styles.input} />
              </View>
              <View style={styles.section}>
                <Text style={styles.label}>Internal Notes</Text>
                <TextInput value={notes} onChangeText={setNotes} placeholder="Team notes and guidance" placeholderTextColor={colors.text.secondary} style={[styles.input, styles.multilineInput]} multiline />
              </View>
              <View style={styles.actionsWrap}>
                <Button mode="outlined" onPress={() => persist('under_review')} disabled={saving}>Mark In Review</Button>
                <Button mode="contained" onPress={() => persist('approved')} loading={saving}>Approve</Button>
                <Button mode="contained-tonal" onPress={() => persist('rejected')} loading={saving}>Reject</Button>
              </View>
              <Button mode="text" onPress={() => setSelected(null)} textColor={colors.text.secondary}>Close</Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.parchment },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary.maroon },
  subtitle: { color: colors.text.secondary, marginTop: spacing.xs },
  filterRow: { gap: spacing.sm, paddingTop: spacing.md },
  filterChip: { backgroundColor: colors.background.warmWhite },
  card: { marginBottom: spacing.md, backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  meta: { color: colors.text.secondary, marginTop: 2 },
  intent: { marginTop: spacing.sm, color: colors.text.primary, lineHeight: 22 },
  statusChip: { alignSelf: 'flex-start' },
  modalContainer: { backgroundColor: colors.background.warmWhite, margin: spacing.md, padding: spacing.lg, borderRadius: borderRadius.xl, maxHeight: '88%' },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.primary.maroon },
  section: { marginTop: spacing.lg },
  label: { fontSize: 12, color: colors.text.secondary, textTransform: 'uppercase', marginBottom: spacing.xs },
  value: { color: colors.text.primary, lineHeight: 22 },
  input: { backgroundColor: colors.background.parchment, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border.gold as string, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text.primary },
  multilineInput: { minHeight: 100, textAlignVertical: 'top' },
  actionsWrap: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginTop: spacing.xl, marginBottom: spacing.md },
});
