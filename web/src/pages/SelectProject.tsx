import React from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Button, 
  Group, 
  Stack,
  ThemeIcon,
  SimpleGrid,
  Box,
  Center,
  Badge,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import { 
  IconPlus, 
  IconFolder,
  IconChevronLeft,
  IconUsers,
  IconCalendar,
  IconRocket,
} from '@tabler/icons-react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useProjects, useOrganization } from '../api/hooks';

export function SelectProject() {
  const navigate = useNavigate();
  const { organization } = useParams();

  // If no organization is selected, redirect immediately
  if (!organization) {
    return <Navigate to="/org" replace />;
  }

  // Fetch organization to validate it exists
  const { data: org, isLoading: orgLoading, error: orgError } = useOrganization(organization);

  // Fetch projects for the organization
  const { 
    data: projects = [], 
    isLoading: projectsLoading, 
    error: projectsError,
    refetch 
  } = useProjects(organization);

  const isLoading = orgLoading || projectsLoading;
  const error = orgError || projectsError;

  // If organization doesn't exist, redirect to org selection
  if (!orgLoading && !org) {
    return <Navigate to="/org" replace />;
  }

  if (isLoading) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="xl">
          <ThemeIcon size={60} radius="md" className="glass-icon glow-effect">
            <IconFolder size={30} />
          </ThemeIcon>
          <Text size="xl" fw={500}>Loading projects...</Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box h="100%" pt={100}>
        <Container size="lg">
          <Card withBorder className="neo-glass">
            <Stack align="center" gap="md" py="xl">
              <ThemeIcon size={60} radius="md" className="glass-icon" color="red">
                <IconFolder size={30} />
              </ThemeIcon>
              <Text ta="center" size="xl" fw={500} c="red">Error Loading Projects</Text>
              <Text ta="center" c="dimmed" maw={400}>
                {error instanceof Error ? error.message : 'Failed to load projects'}
              </Text>
              <Group>
                <Button
                  variant="light"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
                <Button
                  variant="subtle"
                  color="red"
                  onClick={() => navigate('/org')}
                  leftSection={<IconChevronLeft size={16} />}
                >
                  Change Organization
                </Button>
              </Group>
            </Stack>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box h="100%" pt={100}>
      <Container size="lg">
        <Stack gap={50}>
          <Stack gap="xs" align="center">
            <Title order={2} fw={500} className="text-gradient" ta="center">
              {org?.name || 'Loading Organization...'}
            </Title>
            <Text size="lg" c="dimmed" ta="center">
              Select a project or create a new one
            </Text>
          </Stack>

          <Stack gap="xl">
            <Group justify="space-between" align="center">
              <Button
                variant="subtle"
                onClick={() => navigate('/org')}
                leftSection={<IconChevronLeft size={16} />}
              >
                Change Organization
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate(`/org/${organization}/project/create`)}
              >
                Create Project
              </Button>
            </Group>

            {projects.length === 0 ? (
              <Card withBorder className="neo-glass">
                <Stack align="center" gap="md" py="xl">
                  <ThemeIcon
                    size={60}
                    radius="md"
                    className="glass-icon"
                  >
                    <IconFolder size={30} />
                  </ThemeIcon>
                  <Text ta="center" fw={500} size="xl">No Projects Yet</Text>
                  <Text ta="center" size="sm" c="dimmed" maw={400}>
                    Create your first project to start managing your astronomical missions
                  </Text>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => navigate(`/org/${organization}/project/create`)}
                  >
                    Create Project
                  </Button>
                </Stack>
              </Card>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {projects.map((project) => (
                  <Card 
                    key={project.key} 
                    withBorder
                    className="neo-glass home-animate"
                    padding="lg"
                  >
                    <Stack gap="md">
                      <Group>
                        <ThemeIcon
                          size={40}
                          radius="md"
                          className="glass-icon"
                        >
                          <IconFolder size={24} />
                        </ThemeIcon>
                        <Stack gap={4} style={{ flex: 1 }}>
                          <Text fw={500} size="lg" truncate>
                            {project.name}
                          </Text>
                          <Group gap="xs">
                            <Badge size="sm" variant="light">
                              {project.key}
                            </Badge>
                          </Group>
                        </Stack>
                      </Group>

                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {project.description}
                      </Text>

                      <Group gap="xs">
                        <Tooltip label="Team Members">
                          <ThemeIcon variant="light" size="sm" radius="sm">
                            <IconUsers size={14} />
                          </ThemeIcon>
                        </Tooltip>
                        <Tooltip label="Active Missions">
                          <ThemeIcon variant="light" size="sm" radius="sm">
                            <IconRocket size={14} />
                          </ThemeIcon>
                        </Tooltip>
                        <Tooltip label="Last Updated">
                          <ThemeIcon variant="light" size="sm" radius="sm">
                            <IconCalendar size={14} />
                          </ThemeIcon>
                        </Tooltip>
                      </Group>

                      <Button
                        variant="light"
                        fullWidth
                        onClick={() => navigate(`/org/${organization}/project/${project.key}`)}
                      >
                        Select Project
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