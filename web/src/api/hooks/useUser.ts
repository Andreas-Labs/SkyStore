import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { apiClient, UpdateUserPayload, UpdateUserSettingsPayload, ListUsersParams } from '../client';

// Query key factory
const keys = {
  users: {
    all: ['users'] as const,
    lists: () => [...keys.users.all, 'list'] as const,
    detail: (id: string) => [...keys.users.all, 'detail', id] as const,
  },
};

// User hooks
export function useUser(id?: string) {
  return useQuery({
    queryKey: id ? keys.users.detail(id) : keys.users.lists(),
    queryFn: async () => {
      if (id) {
        return apiClient.getUser(id);
      }
      const users = await apiClient.listUsers({});
      return users[0] || null;
    },
    enabled: id ? Boolean(id) : true,
  });
}

export function useListUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: [...keys.users.lists(), params],
    queryFn: () => apiClient.listUsers(params),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      apiClient.updateUser(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(keys.users.detail(data.id), data);
      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update profile',
        color: 'red',
      });
    },
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserSettingsPayload }) =>
      apiClient.updateUserSettings(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(keys.users.detail(data.id), data);
      notifications.show({
        title: 'Success',
        message: 'Settings updated successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update settings',
        color: 'red',
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteUser(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: keys.users.detail(id) });
      notifications.show({
        title: 'Success',
        message: 'Account deleted successfully',
        color: 'green',
      });
      navigate('/');
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete account',
        color: 'red',
      });
    },
  });
} 