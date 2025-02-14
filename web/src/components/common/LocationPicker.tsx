import React from 'react';
import { 
  Group, 
  Text, 
  Menu,
  UnstyledButton,
  Loader,
  Divider,
} from '@mantine/core';
import { 
  IconChevronDown,
  IconHome,
  IconBuildingSkyscraper,
  IconFolders,
  IconRocket,
  IconPlus,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrganizations, useProjects, useMissions } from '../../api/hooks';

interface LocationPickerProps {
  organization?: string;
  project?: string;
  mission?: string;
  showHome?: boolean;
}

export function LocationPicker({ organization, project, mission, showHome = true }: LocationPickerProps) {
  const navigate = useNavigate();
  const { data: organizations = [], isLoading: orgsLoading } = useOrganizations();
  const { data: projects = [], isLoading: projectsLoading } = useProjects(organization ?? '');
  const { data: missions = [], isLoading: missionsLoading } = useMissions(organization ?? '', project ?? '');

  const currentOrg = organizations.find(o => o.key === organization);
  const currentProject = projects.find(p => p.key === project);
  const currentMission = missions.find(m => m.mission === mission);

  return (
    <Group gap="xs">
      {showHome && (
        <UnstyledButton onClick={() => navigate('/')}>
          <Group gap="xs">
            <IconHome size={16} />
            <Text size="sm">Home</Text>
          </Group>
        </UnstyledButton>
      )}

      {showHome && organization && <Text size="sm" c="dimmed">/</Text>}

      <Menu position="bottom-start" shadow="md" width={220}>
        <Menu.Target>
          <UnstyledButton>
            <Group gap={3}>
              <IconBuildingSkyscraper size={16} />
              <Text size="sm" fw={500}>
                {currentOrg?.name || 'Select Organization'}
              </Text>
              <IconChevronDown size={16} />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Organizations</Menu.Label>
          {orgsLoading ? (
            <Menu.Item disabled><Group justify="center"><Loader size="sm" /></Group></Menu.Item>
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

      {organization && <Text size="sm" c="dimmed">/</Text>}

      {organization && (
        <Menu position="bottom-start" shadow="md" width={220}>
          <Menu.Target>
            <UnstyledButton>
              <Group gap={3}>
                <IconFolders size={16} />
                <Text size="sm" fw={500}>
                  {currentProject?.name || 'Select Project'}
                </Text>
                <IconChevronDown size={16} />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Projects</Menu.Label>
            {projectsLoading ? (
              <Menu.Item disabled><Group justify="center"><Loader size="sm" /></Group></Menu.Item>
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
      )}

      {project && <Text size="sm" c="dimmed">/</Text>}

      {project && (
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
            {missionsLoading ? (
              <Menu.Item disabled><Group justify="center"><Loader size="sm" /></Group></Menu.Item>
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
      )}
    </Group>
  );
} 