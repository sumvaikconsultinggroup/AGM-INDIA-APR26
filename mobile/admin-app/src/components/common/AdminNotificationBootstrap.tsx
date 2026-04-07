import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { registerAdminPushNotifications } from '../../services/notifications';

export function AdminNotificationBootstrap() {
  const { admin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !admin?._id) return;

    registerAdminPushNotifications().catch((error) => {
      console.warn('Admin push registration failed', error);
    });
  }, [admin?._id, isAuthenticated]);

  return null;
}
