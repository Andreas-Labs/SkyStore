import React from 'react';
import { Menu, Avatar, Text, UnstyledButton, Group, Skeleton } from '@mantine/core';
import { IconSettings, IconLogout, IconUser } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../contexts/UserContext';

export function ProfileMenu() {
  const navigate = useNavigate();
  const { user, isLoading, setCurrentUserId } = useCurrentUser();

  const handleLogout = () => {
    setCurrentUserId(null);
    navigate('/');
  };

  if (isLoading) {
    return (
      <Group gap="xs">
        <Skeleton height={30} circle />
        <Skeleton height={20} width={100} />
      </Group>
    );
  }

  if (!user) {
    return (
      <UnstyledButton onClick={() => navigate('/profile')}>
        <Group gap="xs">
          <Avatar radius="xl" size="sm" color="blue">?</Avatar>
          <Text size="sm" fw={500}>Sign In</Text>
        </Group>
      </UnstyledButton>
    );
  }

  return (
    <Menu position="bottom-end" shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Group gap="xs">
            <Avatar
              src={user.avatar}
              alt={user.name}
              radius="xl"
              size="sm"
              color="blue"
            >
              {user.name.charAt(0)}
            </Avatar>
            <Text size="sm" fw={500}>
              {user.name}
            </Text>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Profile</Menu.Label>
        <Menu.Item>
          <Text size="sm" fw={500}>{user.name}</Text>
          <Text size="xs" c="dimmed">{user.email}</Text>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconUser size={16} />}
          onClick={() => navigate('/profile')}
        >
          Profile
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSettings size={16} />}
          onClick={() => navigate('/settings')}
        >
          Settings
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={handleLogout}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
} 