import React from 'react';
import { 
  Group, 
  Container,
  Flex,
  AppShell,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { IconRocket } from '@tabler/icons-react';
import { LocationPicker } from '../common/LocationPicker';
import { ProfileMenu } from '../menus/ProfileMenu';
import { OrganizationMenu } from '../menus/OrganizationMenu';
import { ProjectMenu } from '../menus/ProjectMenu';
import { MissionMenu } from '../menus/MissionMenu';
import { LAYOUT } from '../../constants';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { organization, project } = useParams();
  const showLocationPicker = !location.pathname.startsWith('/dashboard');

  return (
    <AppShell.Header h={LAYOUT.header.height}>
      <Container fluid h="100%">
        <Flex h="100%" align="center" justify="space-between">
          <Group>
            <UnstyledButton onClick={() => navigate('/dashboard')}>
              <Group gap="xs">
                <IconRocket size={30} />
                <Text size="lg" fw={700}>SkyStore</Text>
              </Group>
            </UnstyledButton>
            {showLocationPicker && (
              <Group>
                <OrganizationMenu />
                {organization && <ProjectMenu />}
                {organization && project && <MissionMenu />}
              </Group>
            )}
          </Group>

          <ProfileMenu />
        </Flex>
      </Container>
    </AppShell.Header>
  );
} 
