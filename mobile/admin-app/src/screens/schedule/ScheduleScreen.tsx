import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Card,
  FAB,
  ActivityIndicator,
  Chip,
  IconButton,
} from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../theme';
import api from '../../services/api';
import { Schedule } from '../../types';

interface ScheduleSection {
  title: string;
  data: Schedule[];
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface ScheduleFormData {
  month: string;
  locations: string;
  startDate: string;
  endDate: string;
  period: string;
  maxPeople: string;
  appointment: boolean;
}

const EMPTY_FORM: ScheduleFormData = {
  month: '',
  locations: '',
  startDate: '',
  endDate: '',
  period: '',
  maxPeople: '',
  appointment: false,
};

export function ScheduleScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // ── Fetch schedules ──
  const fetchSchedules = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/schedule');
      const data = Array.isArray(response.data) ? response.data : [];
      setSchedules(data.filter((s: Schedule) => !s.isDeleted));
    } catch (err) {
      setError('Failed to load schedules');
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedules();
  }, [fetchSchedules]);

  // ── Group by month ──
  const groupedSchedules = useMemo((): ScheduleSection[] => {
    const groups: Record<string, Schedule[]> = {};

    schedules.forEach((schedule) => {
      const key = schedule.month || 'Unknown';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(schedule);
    });

    // Sort items within each group by earliestStartDate
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        const dateA = a.earliestStartDate ? new Date(a.earliestStartDate).getTime() : 0;
        const dateB = b.earliestStartDate ? new Date(b.earliestStartDate).getTime() : 0;
        return dateA - dateB;
      });
    });

    // Sort sections by the month order
    const sections = Object.keys(groups)
      .map((title) => ({ title, data: groups[title] }))
      .sort((a, b) => {
        const idxA = MONTHS.indexOf(a.title);
        const idxB = MONTHS.indexOf(b.title);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });

    return sections;
  }, [schedules]);

  // ── CRUD helpers ──
  const openCreateModal = () => {
    setEditingSchedule(null);
    setFormData(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    const firstSlot = schedule.timeSlots?.[0];
    setFormData({
      month: schedule.month,
      locations: schedule.locations,
      startDate: firstSlot?.startDate
        ? new Date(firstSlot.startDate).toISOString().split('T')[0]
        : '',
      endDate: firstSlot?.endDate
        ? new Date(firstSlot.endDate).toISOString().split('T')[0]
        : '',
      period: firstSlot?.period ?? '',
      maxPeople: schedule.maxPeople != null ? String(schedule.maxPeople) : '',
      appointment: schedule.appointment ?? false,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    const isValidIsoDate = (value: string) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const parsed = new Date(`${value}T00:00:00`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    };

    if (!formData.month.trim()) {
      Alert.alert('Validation', 'Please select a month.');
      return;
    }
    if (!formData.locations.trim()) {
      Alert.alert('Validation', 'Locations field is required.');
      return;
    }
    if (!formData.startDate.trim() || !formData.endDate.trim()) {
      Alert.alert('Validation', 'Start date and end date are required (YYYY-MM-DD).');
      return;
    }
    if (!isValidIsoDate(formData.startDate.trim()) || !isValidIsoDate(formData.endDate.trim())) {
      Alert.alert('Validation', 'Dates must be in valid YYYY-MM-DD format.');
      return;
    }
    if (new Date(formData.endDate).getTime() < new Date(formData.startDate).getTime()) {
      Alert.alert('Validation', 'End date cannot be earlier than start date.');
      return;
    }

    const body = {
      month: formData.month.trim(),
      locations: formData.locations.trim(),
      timeSlots: [
        {
          period: formData.period.trim() || undefined,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        },
      ],
      appointment: formData.appointment,
      maxPeople: formData.maxPeople ? Number(formData.maxPeople) : undefined,
    };

    try {
      setSaving(true);
      if (editingSchedule) {
        await api.put(`/schedule/${editingSchedule._id}`, body);
      } else {
        await api.post('/schedule', body);
      }
      setModalVisible(false);
      fetchSchedules();
    } catch (err) {
      console.error('Error saving schedule:', err);
      Alert.alert('Error', 'Failed to save schedule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (schedule: Schedule) => {
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to delete the schedule for "${schedule.locations}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/schedule/${schedule._id}`);
              fetchSchedules();
            } catch (err) {
              console.error('Error deleting schedule:', err);
              Alert.alert('Error', 'Failed to delete schedule.');
            }
          },
        },
      ],
    );
  };

  // ── Render helpers ──
  const renderScheduleItem = ({ item }: { item: Schedule }) => {
    const firstSlot = item.timeSlots?.[0];
    const period = firstSlot?.period;

    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.leftStripe} />
          <View style={styles.detailsSection}>
            <Text style={styles.locationText} numberOfLines={2}>
              {item.locations}
            </Text>

            {item.dateRange ? (
              <Text style={styles.dateRangeText}>{item.dateRange}</Text>
            ) : null}

            <View style={styles.metaRow}>
              {period ? (
                <Chip
                  style={styles.periodChip}
                  textStyle={styles.periodChipText}
                  compact
                >
                  {period}
                </Chip>
              ) : null}

              {item.maxPeople != null ? (
                <Text style={styles.maxPeopleText}>Max {item.maxPeople} people</Text>
              ) : null}

              {item.appointment ? (
                <Chip
                  style={styles.appointmentChip}
                  textStyle={styles.appointmentChipText}
                  compact
                >
                  Appointment
                </Chip>
              ) : null}
            </View>

            <View style={styles.cardActionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(item)}
              >
                <IconButton icon="pencil" iconColor={colors.accent.peacock} size={18} />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(item)}
              >
                <IconButton icon="delete" iconColor={colors.status.error} size={18} />
                <Text style={[styles.actionButtonText, { color: colors.status.error }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderSectionHeader = ({ section }: { section: ScheduleSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionCount}>{section.data.length}</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📅</Text>
      <Text style={styles.emptyStateText}>No schedules available</Text>
      <Text style={styles.emptyStateSubtext}>
        Tap the + button to create a new schedule
      </Text>
    </View>
  );

  // ── Month picker modal ──
  const renderMonthPicker = () => (
    <Modal
      visible={monthPickerVisible}
      animationType="fade"
      transparent
      onRequestClose={() => setMonthPickerVisible(false)}
    >
      <TouchableOpacity
        style={styles.pickerOverlay}
        activeOpacity={1}
        onPress={() => setMonthPickerVisible(false)}
      >
        <View style={styles.pickerContent}>
          <Text style={styles.pickerTitle}>Select Month</Text>
          <ScrollView style={styles.pickerScroll}>
            {MONTHS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.pickerItem,
                  formData.month === m && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  setFormData((p) => ({ ...p, month: m }));
                  setMonthPickerVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    formData.month === m && styles.pickerItemTextSelected,
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ── Create / edit modal ──
  const renderFormModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setModalVisible(false)}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
            </Text>
            <IconButton
              icon="close"
              iconColor={colors.text.primary}
              size={24}
              onPress={() => setModalVisible(false)}
            />
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.inputLabel}>Month *</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setMonthPickerVisible(true)}
            >
              <Text
                style={[
                  styles.pickerTriggerText,
                  !formData.month && styles.placeholderText,
                ]}
              >
                {formData.month || 'Select a month'}
              </Text>
              <IconButton icon="chevron-down" size={20} iconColor={colors.text.secondary} />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Locations *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.locations}
              onChangeText={(t) => setFormData((p) => ({ ...p, locations: t }))}
              placeholder="e.g. Mumbai, Delhi"
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={2}
            />

            <Text style={styles.inputLabel}>Start Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.startDate}
              onChangeText={(t) => setFormData((p) => ({ ...p, startDate: t }))}
              placeholder="2025-10-14"
              placeholderTextColor={colors.text.secondary}
              keyboardType="default"
            />

            <Text style={styles.inputLabel}>End Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.endDate}
              onChangeText={(t) => setFormData((p) => ({ ...p, endDate: t }))}
              placeholder="2025-10-15"
              placeholderTextColor={colors.text.secondary}
              keyboardType="default"
            />

            <Text style={styles.inputLabel}>Period</Text>
            <TextInput
              style={styles.textInput}
              value={formData.period}
              onChangeText={(t) => setFormData((p) => ({ ...p, period: t }))}
              placeholder="e.g. Morning, Evening"
              placeholderTextColor={colors.text.secondary}
            />

            <Text style={styles.inputLabel}>Max People</Text>
            <TextInput
              style={styles.textInput}
              value={formData.maxPeople}
              onChangeText={(t) => setFormData((p) => ({ ...p, maxPeople: t }))}
              placeholder="e.g. 50"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
            />

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Appointment Required</Text>
              <Switch
                value={formData.appointment}
                onValueChange={(v) => setFormData((p) => ({ ...p, appointment: v }))}
                trackColor={{
                  false: colors.text.secondary,
                  true: colors.status.success,
                }}
                thumbColor={colors.text.white}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.text.white} />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingSchedule ? 'Update' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // ── Loading / error ──
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={styles.loadingText}>Loading schedules...</Text>
      </View>
    );
  }

  if (error && schedules.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSchedules}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main render ──
  return (
    <View style={styles.container}>
      <SectionList
        sections={groupedSchedules}
        keyExtractor={(item) => item._id}
        renderItem={renderScheduleItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
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

      {renderFormModal()}
      {renderMonthPicker()}
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
    paddingBottom: 100,
  },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary.maroon,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold.light,
  },
  sectionBadge: {
    backgroundColor: colors.gold.main,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary.maroon,
  },

  // ── Schedule card ──
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.md,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
  },
  leftStripe: {
    width: 4,
    backgroundColor: colors.primary.saffron,
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  detailsSection: {
    flex: 1,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  dateRangeText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  periodChip: {
    backgroundColor: colors.accent.peacock,
    height: 24,
  },
  periodChipText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  maxPeopleText: {
    fontSize: 12,
    color: colors.accent.peacock,
    fontWeight: '500',
  },
  appointmentChip: {
    backgroundColor: colors.primary.saffron,
    height: 24,
  },
  appointmentChipText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.gold,
    paddingTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    color: colors.accent.peacock,
    fontWeight: '500',
    marginLeft: -spacing.sm,
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary.saffron,
  },

  // ── Form modal ──
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
  modalBody: {
    paddingBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  textInput: {
    backgroundColor: colors.background.parchment,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.parchment,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 2,
  },
  pickerTriggerText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.secondary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.text.secondary,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: colors.primary.saffron,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.text.white,
    fontWeight: '600',
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // ── Month picker ──
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContent: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '80%',
    maxHeight: '60%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary.maroon,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  pickerScroll: {
    maxHeight: 300,
  },
  pickerItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: 2,
  },
  pickerItemSelected: {
    backgroundColor: colors.primary.saffron,
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  pickerItemTextSelected: {
    color: colors.text.white,
    fontWeight: '600',
  },

  // ── Empty state ──
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
