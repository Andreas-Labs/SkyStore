import React from 'react';
import { 
  Title, 
  Text, 
  Card, 
  Stack,
  Button,
  Group,
  ThemeIcon,
  SimpleGrid,
  Container,
  Center,
  Box,
} from '@mantine/core';
import { IconBuildingSkyscraper, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations } from '../api/hooks';
import { useCurrentUser } from '../contexts/UserContext';

export function SelectOrganization() {
  const navigate = useNavigate();
  const { data: organizations = [], isLoading } = useOrganizations();
  const { user } = useCurrentUser();

  return (
    <Box h="100%" pt={100}>
      <Container size="lg" h="100%">
        <Stack gap={50} justify="flex-start">
          <Stack gap="xs" align="center">
            <Title order={2} fw={500} className="text-gradient" ta="center">
              Welcome back, {user?.name}
            </Title>
            <Text size="lg" c="dimmed" ta="center">
              Select an organization to get started
            </Text>
          </Stack>

          <Stack gap="xl">
            <Group justify="flex-end">
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate('/org/create')}
              >
                Create Organization
              </Button>
            </Group>

            {organizations.length === 0 && !isLoading ? (
              <Card withBorder className="neo-glass">
                <Stack align="center" gap="md" py="xl">
                  <ThemeIcon
                    size={60}
                    radius="md"
                    className="glass-icon"
                  >
                    <IconBuildingSkyscraper size={30} />
                  </ThemeIcon>
                  <Text ta="center" fw={500}>No Organizations Yet</Text>
                  <Text ta="center" size="sm" c="dimmed">
                    Create your first organization to start managing projects
                  </Text>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => navigate('/org/create')}
                  >
                    Create Organization
                  </Button>
                </Stack>
              </Card>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {organizations.map((org) => (
                  <Card 
                    key={org.key} 
                    withBorder
                    className="neo-glass"
                    onClick={() => navigate(`/org/${org.key}`)}
                    style={{ cursor: 'pointer' }}
                    padding="lg"
                  >
                    <Stack gap="md">
                      <Group>
                        <ThemeIcon
                          size={40}
                          radius="md"
                          className="glass-icon"
                        >
                          <IconBuildingSkyscraper size={24} />
                        </ThemeIcon>
                        <Text fw={500} size="lg">{org.name}</Text>
                      </Group>
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {org.description}
                      </Text>
                      <Button 
                        variant="light" 
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/org/${org.key}`);
                        }}
                      >
                        View Projects
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}