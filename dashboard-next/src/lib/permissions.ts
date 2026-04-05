/**
 * RBAC Permission Types for Dashboard
 * Shared type definitions for the permission system.
 */

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

/**
 * Role hierarchy for comparison:
 * superadmin (100) > admin (80) > editor (60) > moderator (40) > viewer (20)
 */
export const ROLE_HIERARCHY: Record<RoleName, number> = {
  superadmin: 100,
  admin: 80,
  editor: 60,
  moderator: 40,
  viewer: 20,
};

/**
 * Check if roleA has higher or equal privilege than roleB
 */
export function hasHigherRole(roleA: RoleName, roleB: RoleName): boolean {
  return (ROLE_HIERARCHY[roleA] || 0) >= (ROLE_HIERARCHY[roleB] || 0);
}
