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
import { Card, FAB, ActivityIndicator, Chip, IconButton } from 'react-native-paper';
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

const BASE_LOCATIONS: Array<Schedule['baseLocation']> = [
  'Haridwar Ashram',
  'Delhi Ashram',
  'Other',
];

interface ScheduleFormData {
  month: string;
  locations: string;
  baseLocation: Schedule['baseLocation'];
  startDate: string;
  endDate: string;
  period: string;
  maxPeople: string;
  slotCapacity: string;
  appointment: boolean;
  publicTitleEn: string;
  publicTitleHi: string;
  publicLocationEn: string;
  publicLocationHi: string;
  publicNotesEn: string;
  publicNotesHi: string;
  changeNote: string;
  isLastMinuteUpdate: boolean;
}

const EMPTY_FORM: ScheduleFormData = {
  month: '',
  locations: '',
  baseLocation: 'Delhi Ashram',
  startDate: '',
  endDate: '',
  period: '',
  maxPeople: '',
  slotCapacity: '',
  appointment: false,
  publicTitleEn: '',
  publicTitleHi: '',
  publicLocationEn: '',
  publicLocationHi: '',
  publicNotesEn: '',
  publicNotesHi: '',
  changeNote: '',
  isLastMinuteUpdate: false,
};

export function ScheduleScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [basePickerVisible, setBasePickerVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

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

  const groupedSchedules = useMemo((): ScheduleSection[] => {
    const groups: Record<string, Schedule[]> = {};

    schedules.forEach((schedule) => {
      const key = schedule.month || 'Unknown';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(schedule);
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        const dateA = a.earliestStartDate ? new Date(a.earliestStartDate).getTime() : 0;
        const dateB = b.earliestStartDate ? new Date(b.earliestStartDate).getTime() : 0;
        return dateA - dateB;
      });
    });

    return Object.keys(groups)
      .map((title) => ({ title, data: groups[title] }))
      .sort((a, b) => MONTHS.indexOf(a.title) - MONTHS.indexOf(b.title));
  }, [schedules]);

  const openCreateModal = () => {
    setEditingSchedule(null);
    setFormData(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (schedule: Schedule) => {
    const firstSlot = schedule.timeSlots?.[0];
    setEditingSchedule(schedule);
    setFormData({
      month: schedule.month,
      locations: schedule.locations,
      baseLocation: schedule.baseLocation || 'Other',
      startDate: firstSlot?.startDate
        ? new Date(firstSlot.startDate).toISOString().split('T')[0]
        : '',
      endDate: firstSlot?.endDate
        ? new Date(firstSlot.endDate).toISOString().split('T')[0]
        : '',
      period: firstSlot?.period ?? '',
      maxPeople: schedule.maxPeople != null ? String(schedule.maxPeople) : '',
      slotCapacity: firstSlot?.slotCapacity != null ? String(firstSlot.slotCapacity) : '',
      appointment: schedule.appointment ?? false,
      publicTitleEn: schedule.publicTitle?.en || '',
      publicTitleHi: schedule.publicTitle?.hi || '',
      publicLocationEn: schedule.publicLocation?.en || '',
      publicLocationHi: schedule.publicLocation?.hi || '',
      publicNotesEn: schedule.publicNotes?.en || '',
      publicNotesHi: schedule.publicNotes?.hi || '',
      changeNote: schedule.changeNote || '',
      isLastMinuteUpdate: Boolean(schedule.isLastMinuteUpdate),
    });
    setModalVisible(true);
  };

  const isValidIsoDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  };

  const handleSave = async () => {
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

    const maxPeople = formData.maxPeople ? Number(formData.maxPeople) : undefined;
    const slotCapacity = formData.slotCapacity ? Number(formData.slotCapacity) : undefined;
    if (maxPeople !== undefined && Number.isNaN(maxPeople)) {
      Alert.alert('Validation', 'Daily appointment capacity must be numeric.');
      return;
    }
    if (slotCapacity !== undefined && Number.isNaN(slotCapacity)) {
      Alert.alert('Validation', 'Slot capacity must be numeric.');
      return;
    }

    const body = {
      month: formData.month.trim(),
      locations: formData.locations.trim(),
      baseLocation: formData.baseLocation,
      timeSlots: [
        {
          period: formData.period.trim() || undefined,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          slotCapacity,
        },
      ],
      appointment: formData.appointment,
      maxPeople,
      publicTitle: {
        en: formData.publicTitleEn.trim() || undefined,
        hi: formData.publicTitleHi.trim() || undefined,
      },
      publicLocation: {
        en: formData.publicLocationEn.trim() || undefined,
        hi: formData.publicLocationHi.trim() || undefined,
      },
      publicNotes: {
        en: formData.publicNotesEn.trim() || undefined,
        hi: formData.publicNotesHi.trim() || undefined,
      },
      changeNote: formData.changeNote.trim() || undefined,
      isLastMinuteUpdate: formData.isLastMinuteUpdate,
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
      ]
    );
  };

  const renderScheduleItem = ({ item }: { item: Schedule }) => {
    const firstSlot = item.timeSlots?.[0];
    const period = firstSlot?.period;
    const slotCapacity = firstSlot?.slotCapacity;

    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.leftStripe} />
          <View style={styles.detailsSection}>
            <Text style={styles.locationText} numberOfLines={2}>
              {item.publicTitle?.en || item.publicTitle?.hi || item.locations}
            </Text>
            <Text style={styles.secondaryText}>
              {item.baseLocation || 'Ashram schedule'}
            </Text>

            {item.dateRange ? <Text style={styles.dateRangeText}>{item.dateRange}</Text> : null}

            <View style={styles.metaRow}>
              {period ? (
                <Chip style={styles.periodChip} textStyle={styles.periodChipText} compact>
                  {period}
                </Chip>
              ) : null}

              {item.appointment ? (
                <Chip style={styles.appointmentChip} textStyle={styles.appointmentChipText} compact>
                  Appointment open
                </Chip>
              ) : null}

              {item.isLastMinuteUpdate ? (
                <Chip style={styles.urgentChip} textStyle={styles.urgentChipText} compact>
                  Last-minute update
                </Chip>
              ) : null}
            </View>

            <View style={styles.metricsRow}>
              <Text style={styles.metricText}>
                Daily capacity: {item.maxPeople ?? 100}
              </Text>
              {slotCapacity ? (
                <Text style={styles.metricText}>Slot cap: {slotCapacity}</Text>
              ) : null}
              {item.currentAppointments != null ? (
                <Text style={styles.metricText}>Booked: {item.currentAppointments}</Text>
              ) : null}
              {item.remainingCapacity != null ? (
                <Text style={styles.metricText}>Open: {item.remainingCapacity}</Text>
              ) : null}
            </View>

            {item.changeNote ? <Text style={styles.changeNoteText}>{item.changeNote}</Text> : null}

            <View style={styles.cardActionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
                <IconButton icon="pencil" iconColor={colors.accent.peacock} size={18} />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
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
        Create the Delhi or Haridwar schedule here and every surface will read from the same source.
      </Text>
    </View>
  );

  const renderSimplePicker = (
    visible: boolean,
    title: string,
    items: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    onClose: () => void
  ) => (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.pickerContent}>
          <Text style={styles.pickerTitle}>{title}</Text>
          <ScrollView style={styles.pickerScroll}>
            {items.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.pickerItem,
                  selectedValue === item && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedValue === item && styles.pickerItemTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

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
              <Text style={[styles.pickerTriggerText, !formData.month && styles.placeholderText]}>
                {formData.month || 'Select a month'}
              </Text>
              <IconButton icon="chevron-down" size={20} iconColor={colors.text.secondary} />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Base Ashram *</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setBasePickerVisible(true)}
            >
              <Text style={styles.pickerTriggerText}>{formData.baseLocation || 'Select base'}</Text>
              <IconButton icon="chevron-down" size={20} iconColor={colors.text.secondary} />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Internal Locations *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.locations}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, locations: value }))}
              placeholder="Exact venue details used by staff"
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={2}
            />

            <Text style={styles.inputLabel}>Public Title (English)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.publicTitleEn}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, publicTitleEn: value }))}
              placeholder="Delhi Ashram darshan and meetings"
              placeholderTextColor={colors.text.secondary}
            />

            <Text style={styles.inputLabel}>Public Title (Hindi)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.publicTitleHi}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, publicTitleHi: value }))}
              placeholder="दिल्ली आश्रम दर्शन एवं मुलाकात"
              placeholderTextColor={colors.text.secondary}
            />

            <Text style={styles.inputLabel}>Public Location (English)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.publicLocationEn}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, publicLocationEn: value }))}
              placeholder="Delhi Ashram, New Delhi"
              placeholderTextColor={colors.text.secondary}
            />

            <Text style={styles.inputLabel}>Public Location (Hindi)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.publicLocationHi}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, publicLocationHi: value }))}
              placeholder="दिल्ली आश्रम, नई दिल्ली"
              placeholderTextColor={colors.text.secondary}
            />

            <Text style={styles.inputLabel}>Start Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.startDate}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, startDate: value }))}
              placeholder="2026-04-07"
              placeholderTextColor={colors.text.secondary}
            />

            <Text style={styles.inputLabel}>End Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.endDate}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, endDate: value }))}
              placeholder="2026-04-07"
              placeholderTextColor={colors.text.secondary}
            />

            <Text style={styles.inputLabel}>Meeting Window</Text>
            <TextInput
              style={styles.textInput}
              value={formData.period}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, period: value }))}
              placeholder="Morning / Evening / Whole day"
              placeholderTextColor={colors.text.secondary}
            />

            <Text style={styles.inputLabel}>Daily Appointment Capacity</Text>
            <TextInput
              style={styles.textInput}
              value={formData.maxPeople}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, maxPeople: value }))}
              placeholder="25"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Slot Capacity Override</Text>
            <TextInput
              style={styles.textInput}
              value={formData.slotCapacity}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, slotCapacity: value }))}
              placeholder="Optional if this date has a special cap"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Public Notes (English)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.publicNotesEn}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, publicNotesEn: value }))}
              placeholder="Instructions for visitors"
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Public Notes (Hindi)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.publicNotesHi}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, publicNotesHi: value }))}
              placeholder="आगंतुकों के लिए निर्देश"
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Change Note</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.changeNote}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, changeNote: value }))}
              placeholder="Use this for last-minute changes or urgent updates"
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={2}
            />

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Accept appointment requests</Text>
              <Switch
                value={formData.appointment}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, appointment: value }))}
                trackColor={{ false: colors.text.secondary, true: colors.status.success }}
                thumbColor={colors.text.white}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Mark as last-minute update</Text>
              <Switch
                value={formData.isLastMinuteUpdate}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, isLastMinuteUpdate: value }))
                }
                trackColor={{ false: colors.text.secondary, true: colors.status.warning }}
                thumbColor={colors.text.white}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
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
                  <Text style={styles.saveButtonText}>{editingSchedule ? 'Update' : 'Create'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

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

      <FAB icon="plus" style={styles.fab} onPress={openCreateModal} color={colors.text.white} />

      {renderFormModal()}
      {renderSimplePicker(
        monthPickerVisible,
        'Select Month',
        MONTHS,
        formData.month,
        (value) => setFormData((prev) => ({ ...prev, month: value })),
        () => setMonthPickerVisible(false)
      )}
      {renderSimplePicker(
        basePickerVisible,
        'Select Base Ashram',
        BASE_LOCATIONS as string[],
        formData.baseLocation || '',
        (value) =>
          setFormData((prev) => ({ ...prev, baseLocation: value as Schedule['baseLocation'] })),
        () => setBasePickerVisible(false)
      )}
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
  secondaryText: {
    fontSize: 12,
    color: colors.text.secondary,
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
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  metricText: {
    fontSize: 12,
    color: colors.accent.peacock,
    fontWeight: '500',
  },
  changeNoteText: {
    fontSize: 12,
    color: colors.status.warning,
    marginTop: spacing.sm,
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
  appointmentChip: {
    backgroundColor: colors.primary.saffron,
    height: 24,
  },
  appointmentChipText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  urgentChip: {
    backgroundColor: colors.status.warning,
    height: 24,
  },
  urgentChipText: {
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
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary.saffron,
  },
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
    maxHeight: '92%',
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
