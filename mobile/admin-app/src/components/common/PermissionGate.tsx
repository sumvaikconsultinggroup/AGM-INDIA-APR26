/**
 * PermissionGate Component
 * Renders children only if the user has the required permission.
 * 
 * Usage:
 *   <PermissionGate module="events" action="create">
 *     <Button onPress={createEvent}>Create Event</Button>
 *   </PermissionGate>
 * 
 *   <PermissionGate module="users" action="delete" fallback={<Text>No access</Text>}>
 *     <Button onPress={deleteUser}>Delete User</Button>
 *   </PermissionGate>
 */

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePermissions, ModuleId, Action } from '../../context/PermissionContext';
import { colors, spacing, borderRadius } from '../../theme';

interface PermissionGateProps {
  module: ModuleId;
  action: Action;
  children: ReactNode;
  fallback?: ReactNode;
  showDenied?: boolean;
}

export function PermissionGate({
  module,
  action,
  children,
  fallback,
  showDenied = false,
}: PermissionGateProps) {
  const { can, isLoading } = usePermissions();

  if (isLoading) return null;

  if (can(module, action)) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  if (showDenied) {
    return (
      <View style={styles.deniedContainer}>
        <Text style={styles.deniedIcon}>🔒</Text>
        <Text style={styles.deniedText}>You don&apos;t have permission to {action} {module}</Text>
      </View>
    );
  }

  return null;
}

/**
 * ModuleGate — Shows/hides an entire module screen
 */
interface ModuleGateProps {
  module: ModuleId;
  children: ReactNode;
}

export function ModuleGate({ module, children }: ModuleGateProps) {
  const { canAccessModule, isLoading, role } = usePermissions();

  if (isLoading) return null;

  if (!canAccessModule(module)) {
    return (
      <View style={styles.fullDenied}>
        <Text style={styles.deniedIconLarge}>🔐</Text>
        <Text style={styles.fullDeniedTitle}>Access Restricted</Text>
        <Text style={styles.fullDeniedText}>
          Your role ({role}) does not have access to this section.
          Contact your administrator for access.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * ActionBar — Renders a row of action buttons filtered by permissions
 */
interface ActionItem {
  action: Action;
  label: string;
  onPress: () => void;
  color?: string;
  destructive?: boolean;
}

interface ActionBarProps {
  module: ModuleId;
  actions: ActionItem[];
}

export function ActionBar({ module, actions }: ActionBarProps) {
  const { can } = usePermissions();

  const allowedActions = actions.filter(a => can(module, a.action));

  if (allowedActions.length === 0) return null;

  return (
    <View style={styles.actionBar}>
      {allowedActions.map(({ label, onPress, color, destructive }) => (
        <View key={label} style={[
          styles.actionButton,
          { backgroundColor: destructive ? colors.status.error : (color || colors.primary.saffron) },
        ]}>
          <Text onPress={onPress} style={styles.actionButtonText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  deniedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: 'rgba(244,67,54,0.08)',
    borderRadius: borderRadius.sm,
    marginVertical: spacing.xs,
  },
  deniedIcon: { fontSize: 16, marginRight: spacing.xs },
  deniedText: { fontSize: 13, color: colors.text.secondary, flex: 1 },

  fullDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.parchment,
  },
  deniedIconLarge: { fontSize: 48, marginBottom: spacing.md },
  fullDeniedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary.maroon,
    marginBottom: spacing.sm,
  },
  fullDeniedText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  actionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
