import React from 'react';
import { Menu, Text, UnstyledButton, Group, Loader } from '@mantine/core';
import { IconChevronDown, IconPlus, IconBuilding } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrganizations } from '../../api/hooks';

export function OrganizationMenu() {
  const navigate = useNavigate();
  const { organization } = useParams();
  const { data: organizations = [], isLoading, error } = useOrganizations();
  const currentOrganization = organizations.find(org => org.key === organization);

  return (
    <Menu position="bottom-start" shadow="md" width={220}>
      <Menu.Target>
        <UnstyledButton>
          <Group gap={3}>
            <IconBuilding size={16} />
            <Text size="sm" fw={500}>
              {currentOrganization?.name || 'Select Organization'}
            </Text>
            <IconChevronDown size={16} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Organizations</Menu.Label>
        {isLoading ? (
          <Menu.Item disabled><Group justify="center"><Loader size="sm" /></Group></Menu.Item>
        ) : error ? (
          <Menu.Item disabled color="red"><Text size="sm" c="red">Failed to load organizations</Text></Menu.Item>
        ) : organizations.length === 0 ? (
          <Menu.Item disabled><Text size="sm" c="dimmed">No organizations found</Text></Menu.Item>
        ) : (
          organizations.map((org) => (
            <Menu.Item 
              key={org.key} 
              onClick={() => navigate(`/org/${org.key}`)}
            >
              <Text size="sm">{org.name}</Text>
            </Menu.Item>
          ))
        )}
        <Menu.Divider />
        <Menu.Item 
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate('/org/create')}
        >
          Create Organization
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
} 