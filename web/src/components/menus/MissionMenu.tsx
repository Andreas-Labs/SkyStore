import React from 'react';
import { Menu, Text, UnstyledButton, Group, Loader } from '@mantine/core';
import { IconChevronDown, IconPlus, IconRocket } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMissions } from '../../api/hooks';

export function MissionMenu() {
  const navigate = useNavigate();
  const { organization, project, mission } = useParams();
  const { data: missions = [], isLoading, error } = useMissions(organization || '', project || '');
  const currentMission = missions.find(m => m.mission === mission);

  if (!organization || !project) return null;

  return (
    <Menu position="bottom-start" shadow="md" width={220}>
      <Menu.Target>
        <UnstyledButton>
          <Group gap={3}>
            <IconRocket size={16} />
            <Text size="sm" fw={500}>
              {currentMission?.name || 'Select Mission'}
            </Text>
            <IconChevronDown size={16} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Missions</Menu.Label>
        {isLoading ? (
          <Menu.Item disabled><Group justify="center"><Loader size="sm" /></Group></Menu.Item>
        ) : error ? (
          <Menu.Item disabled color="red"><Text size="sm" c="red">Failed to load missions</Text></Menu.Item>
        ) : missions.length === 0 ? (
          <Menu.Item disabled><Text size="sm" c="dimmed">No missions found</Text></Menu.Item>
        ) : (
          missions.map((m) => (
            <Menu.Item 
              key={m.mission} 
              onClick={() => navigate(`/org/${organization}/project/${project}/mission/${m.mission}`)}
            >
              <Text size="sm">{m.name}</Text>
            </Menu.Item>
          ))
        )}
        <Menu.Divider />
        <Menu.Item 
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate(`/org/${organization}/project/${project}/mission/create`)}
        >
          Create Mission
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
} 