import React from 'react';
import { Menu, Text, UnstyledButton, Group, Loader } from '@mantine/core';
import { IconChevronDown, IconPlus, IconFolder } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '../../api/hooks';

export function ProjectMenu() {
  const navigate = useNavigate();
  const { organization, project } = useParams();
  const { data: projects = [], isLoading, error } = useProjects(organization || '');
  const currentProject = projects.find(p => p.key === project);

  if (!organization) return null;

  return (
    <Menu position="bottom-start" shadow="md" width={220}>
      <Menu.Target>
        <UnstyledButton>
          <Group gap={3}>
            <IconFolder size={16} />
            <Text size="sm" fw={500}>
              {currentProject?.name || 'Select Project'}
            </Text>
            <IconChevronDown size={16} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Projects</Menu.Label>
        {isLoading ? (
          <Menu.Item disabled><Group justify="center"><Loader size="sm" /></Group></Menu.Item>
        ) : error ? (
          <Menu.Item disabled color="red"><Text size="sm" c="red">Failed to load projects</Text></Menu.Item>
        ) : projects.length === 0 ? (
          <Menu.Item disabled><Text size="sm" c="dimmed">No projects found</Text></Menu.Item>
        ) : (
          projects.map((proj) => (
            <Menu.Item 
              key={proj.key} 
              onClick={() => navigate(`/org/${organization}/project/${proj.key}`)}
            >
              <Text size="sm">{proj.name}</Text>
            </Menu.Item>
          ))
        )}
        <Menu.Divider />
        <Menu.Item 
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate(`/org/${organization}/project/create`)}
        >
          Create Project
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
} 