'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ServiceId } from '@/lib/services';

const ROLE_KEY = 'role'; // "superadmin" | "user"
const TOGGLES_KEY = 'service_toggles_v1';

type Role = 'superadmin' | 'user';

export type ServiceToggles = Record<ServiceId, boolean>;

const defaultToggles: ServiceToggles = {
  dashboard: true,
  events: true,
  donations: true,
  schedule: true,
  servicesManagement: true,
  scheduleRegistrations: true,
  connect: true,
  books: true,
  rooms: true,
  users: true,
  glimpse: true,
  imagelibrary: true,
  volunteers: true,
  printMedia: true,
  dikshaMantra: true,
  dailySchedule: true,
  website: true, // single toggle for all website items
};


function readRole(): Role {
  if (typeof window === 'undefined') return 'user';
  const raw = window.localStorage.getItem('user'); // assuming you save it as "user"
  if (!raw) return 'user';

  try {
    const parsed = JSON.parse(raw);
    if (parsed.role === 'superadmin' || parsed.role === 'user') {
      return parsed.role;
    }
  } catch {
    return 'user';
  }
  return 'user';
}


function writeRole(role: Role) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ROLE_KEY, role);
}

function readToggles(): ServiceToggles {
  if (typeof window === 'undefined') return defaultToggles;
  const raw = window.localStorage.getItem('user');
  if (!raw) return defaultToggles;

  try {
    const parsed = JSON.parse(raw);
    const allowed = parsed.allowedService || [];

    // Build toggles: true for allowed, false for others
    const toggles: ServiceToggles = Object.keys(defaultToggles).reduce((acc, key) => {
      acc[key as ServiceId] = allowed.length === 0 || allowed.includes(key);
      return acc;
    }, {} as ServiceToggles);

    return toggles;
  } catch {
    return defaultToggles;
  }
}


function writeToggles(toggles: ServiceToggles) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOGGLES_KEY, JSON.stringify(toggles));
}

export function usePermissions() {
  const [mounted, setMounted] = useState(false);
  const [role, setRoleState] = useState<Role>('user');
  const [toggles, setToggles] = useState<ServiceToggles>(defaultToggles);

  useEffect(() => {
    setRoleState(readRole());
    setToggles(readToggles());
    setMounted(true);
  }, []);

  // cross-tab sync
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === ROLE_KEY) {
        setRoleState(readRole());
      }
      if (e.key === TOGGLES_KEY) {
        setToggles(readToggles());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    writeRole(next);
  }, []);

  const setToggle = useCallback((id: ServiceId, enabled: boolean) => {
    setToggles(prev => {
      const next = { ...prev, [id]: enabled };
      writeToggles(next);
      return next;
    });
  }, []);

  const enableAll = useCallback(() => {
    setToggles(() => {
      writeToggles(defaultToggles);
      return defaultToggles;
    });
  }, []);

  const disableAll = useCallback(() => {
    const allOff = Object.keys(defaultToggles).reduce((acc, k) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      acc[k as any] = false;
      return acc;
    }, {} as ServiceToggles);
    setToggles(() => {
      writeToggles(allOff);
      return allOff;
    });
  }, []);

  const isServiceEnabled = useCallback(
    (id: ServiceId) => {
      return !!toggles[id];
    },
    [toggles]
  );

  const value = useMemo(
    () => ({
      mounted,
      role,
      setRole,
      toggles,
      setToggle,
      isServiceEnabled,
      enableAll,
      disableAll,
    }),
    [mounted, role, setRole, toggles, setToggle, isServiceEnabled, enableAll, disableAll]
  );

  return value;
}
