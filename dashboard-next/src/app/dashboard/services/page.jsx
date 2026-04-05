'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { services } from '@/lib/services';
import { usePermissions } from '@/hooks/use-permissions';

export default function ServicesPermissionsPage() {
  const router = useRouter();
  const { mounted, role } = usePermissions();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const isSuperadmin = role === 'superadmin';

  // Redirect non-superadmin away once mounted
  useEffect(() => {
    if (!mounted) return;
    if (!isSuperadmin) {
      router.push('/');
    }
  }, [mounted, isSuperadmin, router]);

  // Fetch all users
  useEffect(() => {
    if (mounted && isSuperadmin) {
      fetchUsers();
    }
  }, [mounted, isSuperadmin]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users/new');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update individual user permission
  const updateUserPermission = async (userId, serviceId, enabled) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/users/all-permissions/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId, enabled }),
      });

      if (response.ok) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === userId) {
              const allowedService = user.allowedService || [];
              if (enabled) {
                return {
                  ...user,
                  allowedService: [...allowedService.filter(s => s !== serviceId), serviceId]
                };
              } else {
                return {
                  ...user,
                  allowedService: allowedService.filter(s => s !== serviceId)
                };
              }
            }
            return user;
          })
        );
      } else {
        console.error('Failed to update user permission');
      }
    } catch (error) {
      console.error('Error updating user permission:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Bulk update user permissions
  const bulkUpdateUserPermissions = async (userId, enabledServices) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/users/all-permissions/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabledServices }),
      });

      if (response.ok) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, allowedService: enabledServices }
              : user
          )
        );
      } else {
        console.error('Failed to bulk update user permissions');
      }
    } catch (error) {
      console.error('Error bulk updating user permissions:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Enable all services for a user
  const handleEnableAllForUser = async (userId) => {
    const allServiceIds = services.map(s => s.id);
    await bulkUpdateUserPermissions(userId, allServiceIds);
  };

  // Disable all services for a user
  const handleDisableAllForUser = async (userId) => {
    await bulkUpdateUserPermissions(userId, []);
  };

  // Bulk update all users
  const bulkUpdateAllUsers = async (enabledServices) => {
    try {
      setIsUpdating(true);
      const promises = users.map(user => 
        bulkUpdateUserPermissions(user._id, enabledServices)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error bulk updating all users:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEnableAllForAllUsers = () => {
    const allServiceIds = services.map(s => s.id);
    bulkUpdateAllUsers(allServiceIds);
  };

  const handleDisableAllForAllUsers = () => {
    bulkUpdateAllUsers([]);
  };

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">User Permissions</h1>
          <p className="text-muted-foreground">
            Manage service permissions for individual users.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleEnableAllForAllUsers}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Enable All for Everyone'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDisableAllForAllUsers}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Disable All for Everyone'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {users.map(user => (
          <Card key={user._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name || user.username}</CardTitle>
                    <CardDescription>
                      @{user.username} • {user.email} • Role: {user.role}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {user.allowedService?.length || 0} services enabled
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEnableAllForUser(user._id)}
                    disabled={isUpdating}
                  >
                    Enable All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDisableAllForUser(user._id)}
                    disabled={isUpdating}
                  >
                    Disable All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {services.map(service => {
                  const Icon = service.icon;
                  const userAllowedServices = user.allowedService || [];
                  const isEnabled = userAllowedServices.includes(service.id);
                  
                  return (
                    <div key={service.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md border p-2">
                          <Icon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{service.name}</div>
                          <div className="text-xs text-muted-foreground">{service.route}</div>
                        </div>
                      </div>
                      <Switch 
                        checked={isEnabled} 
                        onCheckedChange={(enabled) => updateUserPermission(user._id, service.id, enabled)}
                        disabled={isUpdating}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isUpdating && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg">
          Updating permissions...
        </div>
      )}
    </div>
  );
}
