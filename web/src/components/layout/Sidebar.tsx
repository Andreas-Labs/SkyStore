import React from 'react';
import { NavLink, Stack, Text, Group } from '@mantine/core';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  IconHome,
  IconRocket,
  IconPhoto,
  IconSettings,
  IconChecklist,
} from '@tabler/icons-react';
import { useMission } from '../../api/hooks';

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  path: string;
  active: boolean;
  disabled?: boolean;
  selectedItem?: string;
  onClick: () => void;
}

function NavItem({ label, icon, active, disabled, selectedItem, onClick }: NavItemProps) {
  return (
    <NavLink
      label={
        <Group gap="xs">
          {icon}
          <Stack gap={0}>
            <Text size="sm">{label}</Text>
            {selectedItem && (
              <Text size="xs" c="dimmed" truncate>
                {selectedItem}
              </Text>
            )}
          </Stack>
        </Group>
      }
      active={active}
      disabled={disabled}
      onClick={onClick}
    />
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { organization, project, mission } = useParams();
  const { data: missionData } = useMission(organization ?? '', project ?? '', mission ?? '');

  const navItems = [
    {
      label: 'Home',
      icon: <IconHome size="1.2rem" />,
      path: `/org/${organization}/project/${project}`,
      active: location.pathname === `/org/${organization}/project/${project}`,
      disabled: !organization || !project,
      onClick: () => organization && project && navigate(`/org/${organization}/project/${project}`),
    },
    {
      label: 'Mission',
      icon: <IconRocket size="1.2rem" />,
      path: `/org/${organization}/project/${project}/mission/${mission}`,
      active: Boolean(mission && !location.pathname.includes('/assets') && !location.pathname.includes('/tasks')),
      disabled: !organization || !project || !mission,
      selectedItem: missionData?.name,
      onClick: () => organization && project && mission && 
        navigate(`/org/${organization}/project/${project}/mission/${mission}`),
    },
    {
      label: 'Assets',
      icon: <IconPhoto size="1.2rem" />,
      path: `/org/${organization}/project/${project}/mission/${mission}/assets`,
      active: Boolean(mission && location.pathname.includes('/assets')),
      disabled: !organization || !project || !mission,
      selectedItem: missionData?.name,
      onClick: () => organization && project && mission && 
        navigate(`/org/${organization}/project/${project}/mission/${mission}/assets`),
    },
    {
      label: 'Tasks',
      icon: <IconChecklist size="1.2rem" />,
      path: `/org/${organization}/project/${project}/mission/${mission}/tasks`,
      active: Boolean(mission && location.pathname.includes('/tasks')),
      disabled: !organization || !project || !mission,
      selectedItem: missionData?.name,
      onClick: () => organization && project && mission && 
        navigate(`/org/${organization}/project/${project}/mission/${mission}/tasks`),
    },
    {
      label: 'Settings',
      icon: <IconSettings size="1.2rem" />,
      path: `/org/${organization}/project/${project}/settings`,
      active: Boolean(project && location.pathname.endsWith('/settings')),
      disabled: !organization || !project,
      onClick: () => organization && project && 
        navigate(`/org/${organization}/project/${project}/settings`),
    },
  ];

  return (
    <Stack p="md">
      {navItems.map((item) => (
        <NavItem key={item.label} {...item} />
      ))}
    </Stack>
  );
} 