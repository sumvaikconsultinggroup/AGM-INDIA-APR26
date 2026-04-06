/**
 * RBAC Permission System for Admin Mobile App
 * Enterprise-grade role-based access control.
 * 
 * Roles: superadmin > admin > editor > moderator > viewer
 * Each role has granular permissions per module.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

// ─── Permission Types ────────────────────────────────────────────────

export type ModuleId =
  | 'dashboard'
  | 'events'
  | 'donations'
  | 'donationsRecord'
  | 'schedule'
  | 'users'
  | 'books'
  | 'articles'
  | 'videos'
  | 'podcasts'
  | 'rooms'
  | 'volunteers'
  | 'messages'
  | 'glimpse'
  | 'imagelibrary'
  | 'printMedia'
  | 'mantraDiksha'
  | 'dailySchedule'
  | 'livestream'
  | 'tvSchedule'
  | 'dailyVichar'
  | 'chatbot'
  | 'notifications'
  | 'sevaBoard'
  | 'smartNotes'
  | 'website'
  | 'services';

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve';

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  approve: boolean;
}

export type PermissionMap = Partial<Record<ModuleId, Partial<ModulePermission>>>;

export type RoleName = 'superadmin' | 'admin' | 'editor' | 'moderator' | 'viewer';

// ─── Default Role Templates ──────────────────────────────────────────

const ALL_ACTIONS: ModulePermission = {
  view: true, create: true, edit: true, delete: true, export: true, approve: true,
};

const VIEW_ONLY: ModulePermission = {
  view: true, create: false, edit: false, delete: false, export: false, approve: false,
};

const CONTENT_EDIT: ModulePermission = {
  view: true, create: true, edit: true, delete: false, export: false, approve: false,
};

const MODERATE: ModulePermission = {
  view: true, create: false, edit: false, delete: false, export: true, approve: true,
};

const ALL_MODULES: ModuleId[] = [
  'dashboard', 'events', 'donations', 'donationsRecord', 'schedule', 'users',
  'books', 'articles', 'videos', 'podcasts', 'rooms', 'volunteers', 'messages',
  'glimpse', 'imagelibrary', 'printMedia', 'mantraDiksha', 'dailySchedule',
  'livestream', 'tvSchedule', 'dailyVichar', 'chatbot', 'notifications', 'sevaBoard', 'smartNotes', 'website', 'services',
];

const CONTENT_MODULES: ModuleId[] = [
  'events', 'books', 'articles', 'videos', 'podcasts',
  'glimpse', 'printMedia', 'dailyVichar', 'tvSchedule', 'dailySchedule',
];

export const ROLE_TEMPLATES: Record<RoleName, PermissionMap> = {
  superadmin: Object.fromEntries(ALL_MODULES.map(m => [m, { ...ALL_ACTIONS }])) as PermissionMap,

  admin: Object.fromEntries(
    ALL_MODULES.map(m => [m, m === 'services' ? { ...VIEW_ONLY } : { ...ALL_ACTIONS }])
  ) as PermissionMap,

  editor: Object.fromEntries(
    ALL_MODULES.map(m => {
      if (m === 'dashboard') return [m, { ...VIEW_ONLY }];
      if (CONTENT_MODULES.includes(m)) return [m, { ...CONTENT_EDIT }];
      return [m, { ...VIEW_ONLY }];
    })
  ) as PermissionMap,

  moderator: Object.fromEntries(
    ALL_MODULES.map(m => {
      if (['volunteers', 'messages', 'rooms', 'sevaBoard', 'mantraDiksha'].includes(m)) return [m, { ...MODERATE }];
      if (m === 'dashboard') return [m, { ...VIEW_ONLY }];
      return [m, { ...VIEW_ONLY }];
    })
  ) as PermissionMap,

  viewer: Object.fromEntries(
    ALL_MODULES.map(m => [m, { ...VIEW_ONLY }])
  ) as PermissionMap,
};

// ─── Permission Context ──────────────────────────────────────────────

interface PermissionContextType {
  permissions: PermissionMap;
  role: RoleName;
  isLoading: boolean;
  can: (module: ModuleId, action: Action) => boolean;
  canAny: (module: ModuleId, actions: Action[]) => boolean;
  canAll: (module: ModuleId, actions: Action[]) => boolean;
  canAccessModule: (module: ModuleId) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { admin, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [role, setRole] = useState<RoleName>('viewer');
  const [isLoading, setIsLoading] = useState(true);

  const resolvePermissions = useCallback(async () => {
    if (!isAuthenticated || !admin) {
      setPermissions(ROLE_TEMPLATES.viewer);
      setRole('viewer');
      setIsLoading(false);
      return;
    }

    try {
      // Try fetching custom permissions from server
      const response = await api.get(`/users/all-permissions/${admin._id}`);
      const serverPerms = response.data?.permissions;
      const serverRole = (response.data?.role || admin.role || 'viewer') as RoleName;

      if (serverPerms && Object.keys(serverPerms).length > 0) {
        // Server has custom permissions — use them
        setPermissions(serverPerms);
        setRole(serverRole);
      } else {
        // Fall back to role-based template
        const roleKey = (serverRole in ROLE_TEMPLATES ? serverRole : 'viewer') as RoleName;
        setPermissions(ROLE_TEMPLATES[roleKey]);
        setRole(roleKey);
      }
    } catch {
      // Server permission fetch failed — use role template
      const roleKey = ((admin.role || 'admin') in ROLE_TEMPLATES
        ? (admin.role as RoleName)
        : 'admin') as RoleName;
      setPermissions(ROLE_TEMPLATES[roleKey]);
      setRole(roleKey);
    } finally {
      setIsLoading(false);
    }
  }, [admin, isAuthenticated]);

  useEffect(() => {
    resolvePermissions();
  }, [resolvePermissions]);

  const can = useCallback(
    (module: ModuleId, action: Action): boolean => {
      if (role === 'superadmin') return true;
      const modulePerms = permissions[module];
      if (!modulePerms) return false;
      return modulePerms[action] === true;
    },
    [permissions, role]
  );

  const canAny = useCallback(
    (module: ModuleId, actions: Action[]): boolean => {
      return actions.some(action => can(module, action));
    },
    [can]
  );

  const canAll = useCallback(
    (module: ModuleId, actions: Action[]): boolean => {
      return actions.every(action => can(module, action));
    },
    [can]
  );

  const canAccessModule = useCallback(
    (module: ModuleId): boolean => can(module, 'view'),
    [can]
  );

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        role,
        isLoading,
        can,
        canAny,
        canAll,
        canAccessModule,
        refreshPermissions: resolvePermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermissions must be used within PermissionProvider');
  return context;
}
