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
  Chip,
  Portal,
  Modal,
  Button,
} from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../theme';
import api from '../../services/api';
import { Volunteer } from '../../types';

export function VolunteersScreen() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailVolunteer, setDetailVolunteer] = useState<Volunteer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVolunteers = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/volunteer');
      const data = Array.isArray(response.data) ? response.data : [];
      setVolunteers(data.filter((v: Volunteer) => !v.isDeleted));
    } catch (err) {
      setError('Failed to load volunteers');
      console.error('Error fetching volunteers:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVolunteers();
  }, [fetchVolunteers]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleApprove = async (volunteer: Volunteer) => {
    setActionLoading(true);
    try {
      await api.put(`/volunteer/${volunteer._id}`, { isApproved: true });
      fetchVolunteers();
      if (detailVolunteer?._id === volunteer._id) {
        setDetailVolunteer({ ...volunteer, isApproved: true });
      }
    } catch (err) {
      console.error('Error approving volunteer:', err);
      Alert.alert('Error', 'Failed to approve volunteer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (volunteer: Volunteer) => {
    setActionLoading(true);
    try {
      await api.put(`/volunteer/${volunteer._id}`, { isApproved: false });
      fetchVolunteers();
      if (detailVolunteer?._id === volunteer._id) {
        setDetailVolunteer({ ...volunteer, isApproved: false });
      }
    } catch (err) {
      console.error('Error rejecting volunteer:', err);
      Alert.alert('Error', 'Failed to reject volunteer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (volunteer: Volunteer) => {
    Alert.alert(
      'Delete Volunteer',
      `Are you sure you want to delete "${volunteer.fullName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/volunteer/${volunteer._id}`);
              if (detailVolunteer?._id === volunteer._id) {
                setDetailVolunteer(null);
              }
              fetchVolunteers();
            } catch (err) {
              console.error('Error deleting volunteer:', err);
              Alert.alert('Error', 'Failed to delete volunteer.');
            }
          },
        },
      ],
    );
  };

  const renderVolunteerCard = ({ item }: { item: Volunteer }) => {
    const isApproved = item.isApproved === true;
    const statusLabel = isApproved ? 'Approved' : 'Pending';
    const statusColor = isApproved ? colors.status.success : colors.status.warning;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setDetailVolunteer(item)}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {item.fullName?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.volunteerInfo}>
                <Text style={styles.volunteerName}>{item.fullName}</Text>
                {item.location ? (
                  <Text style={styles.volunteerLocation}>📍 {item.location}</Text>
                ) : null}
                <Text style={styles.volunteerEmail}>{item.email}</Text>
              </View>
              <Chip
                style={[styles.statusChip, { backgroundColor: statusColor }]}
                textStyle={styles.statusChipText}
                compact
              >
                {statusLabel}
              </Chip>
            </View>

            {item.skills && item.skills.length > 0 && (
              <View style={styles.skillsSection}>
                <View style={styles.skillsContainer}>
                  {item.skills.slice(0, 4).map((skill, index) => (
                    <Chip
                      key={index}
                      style={styles.skillChip}
                      textStyle={styles.skillChipText}
                      compact
                    >
                      {skill}
                    </Chip>
                  ))}
                  {item.skills.length > 4 && (
                    <Text style={styles.moreSkills}>
                      +{item.skills.length - 4} more
                    </Text>
                  )}
                </View>
              </View>
            )}

            <View style={styles.cardActions}>
              <Text style={styles.dateText}>
                Applied: {formatDate(item.createdAt)}
              </Text>
              <View style={styles.actionButtons}>
                {!isApproved && (
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(item)}
                  >
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteBtnSmall}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deleteBtnSmallText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🙋</Text>
      <Text style={styles.emptyStateText}>No volunteers</Text>
      <Text style={styles.emptyStateSubtext}>
        Volunteer applications will appear here
      </Text>
    </View>
  );

  const renderHeader = () => {
    const total = volunteers.length;
    const approved = volunteers.filter((v) => v.isApproved === true).length;
    const pending = volunteers.filter((v) => !v.isApproved).length;

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Volunteer Overview</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{total}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.status.success }]}>
              {approved}
            </Text>
            <Text style={styles.summaryLabel}>Approved</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.status.warning }]}>
              {pending}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDetailField = (label: string, value?: string | number | boolean | null) => {
    if (value === undefined || value === null || value === '') return null;
    const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
    return (
      <View style={styles.detailField}>
        <Text style={styles.detailFieldLabel}>{label}</Text>
        <Text style={styles.detailFieldValue}>{display}</Text>
      </View>
    );
  };

  const renderDetailModal = () => {
    if (!detailVolunteer) return null;
    const v = detailVolunteer;
    const isApproved = v.isApproved === true;

    return (
      <Portal>
        <Modal
          visible={!!detailVolunteer}
          onDismiss={() => setDetailVolunteer(null)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <View style={[styles.avatarContainerLarge, { backgroundColor: isApproved ? colors.status.success : colors.status.warning }]}>
                <Text style={styles.avatarTextLarge}>
                  {v.fullName?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={styles.modalName}>{v.fullName}</Text>
              <Chip
                style={[styles.statusChip, { backgroundColor: isApproved ? colors.status.success : colors.status.warning }]}
                textStyle={styles.statusChipText}
                compact
              >
                {isApproved ? 'Approved' : 'Pending'}
              </Chip>
            </View>

            {renderDetailField('Email', v.email)}
            {renderDetailField('Phone', v.phone)}
            {renderDetailField('Location', v.location)}
            {renderDetailField('Age', v.age)}
            {renderDetailField('Occupation Type', v.occupationType)}
            {renderDetailField('Occupation', v.occupation)}
            {renderDetailField('Available From', v.availableFrom ? formatDate(v.availableFrom) : undefined)}
            {renderDetailField('Available Until', v.availableUntil ? formatDate(v.availableUntil) : undefined)}
            {renderDetailField('Motivation', v.motivation)}
            {renderDetailField('Experience', v.experience)}
            {renderDetailField('Consent', v.consent)}

            {v.availability && v.availability.length > 0 && (
              <View style={styles.detailField}>
                <Text style={styles.detailFieldLabel}>Availability</Text>
                <View style={styles.tagRow}>
                  {v.availability.map((a, i) => (
                    <Chip key={i} style={styles.skillChip} textStyle={styles.skillChipText} compact>{a}</Chip>
                  ))}
                </View>
              </View>
            )}

            {v.skills && v.skills.length > 0 && (
              <View style={styles.detailField}>
                <Text style={styles.detailFieldLabel}>Skills</Text>
                <View style={styles.tagRow}>
                  {v.skills.map((s, i) => (
                    <Chip key={i} style={styles.skillChip} textStyle={styles.skillChipText} compact>{s}</Chip>
                  ))}
                </View>
              </View>
            )}

            {renderDetailField('Applied', formatDate(v.createdAt))}

            <View style={styles.modalActions}>
              {!isApproved && (
                <Button
                  mode="contained"
                  onPress={() => handleApprove(v)}
                  loading={actionLoading}
                  disabled={actionLoading}
                  buttonColor={colors.status.success}
                  style={styles.modalActionBtn}
                >
                  Approve
                </Button>
              )}
              {isApproved && (
                <Button
                  mode="contained"
                  onPress={() => handleReject(v)}
                  loading={actionLoading}
                  disabled={actionLoading}
                  buttonColor={colors.status.warning}
                  style={styles.modalActionBtn}
                >
                  Reject
                </Button>
              )}
              <Button
                mode="contained"
                onPress={() => handleDelete(v)}
                buttonColor={colors.status.error}
                style={styles.modalActionBtn}
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
        <Text style={styles.loadingText}>Loading volunteers...</Text>
      </View>
    );
  }

  if (error && volunteers.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchVolunteers}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={volunteers}
        keyExtractor={(item) => item._id}
        renderItem={renderVolunteerCard}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={volunteers.length > 0 ? renderHeader : null}
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
  summaryCard: {
    backgroundColor: colors.primary.saffron,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    color: colors.text.white,
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
    color: 'rgba(255, 255, 255, 0.8)',
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
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent.peacock,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.text.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarContainerLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarTextLarge: {
    color: colors.text.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  volunteerLocation: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  volunteerEmail: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statusChip: {
    height: 26,
  },
  statusChipText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  skillsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.gold as string,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  skillChip: {
    backgroundColor: colors.background.sandstone,
    height: 24,
  },
  skillChipText: {
    color: colors.text.primary,
    fontSize: 11,
  },
  moreSkills: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.gold as string,
  },
  dateText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  approveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.status.success,
  },
  approveBtnText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtnSmall: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.status.error,
  },
  deleteBtnSmallText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    backgroundColor: colors.background.warmWhite,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.maroon,
    marginBottom: spacing.sm,
  },
  detailField: {
    marginBottom: spacing.md,
  },
  detailFieldLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailFieldValue: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.gold as string,
  },
  modalActionBtn: {
    flex: 1,
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
