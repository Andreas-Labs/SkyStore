import React from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  Stack,
  Card,
  SimpleGrid,
  Center,
  Loader,
  BackgroundImage,
  Overlay,
  Box,
  ThemeIcon,
  rem,
  Paper,
} from '@mantine/core';
import { createStyles } from '@mantine/styles';
import { 
  IconBuildingSkyscraper, 
  IconUser, 
  IconPlus,
  IconRocket,
  IconPhoto,
  IconChartBar,
  IconMap,
  IconCloud,
  IconDatabase,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations } from '../api/hooks';
import { useCurrentUser } from '../contexts/UserContext';

// Custom styles
const useStyles = createStyles((theme) => ({
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',

    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
  },

  neonButton: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 0 20px rgba(0, 149, 255, 0.2)',
    transition: 'all 0.2s ease',

    '&:hover': {
      boxShadow: '0 0 30px rgba(0, 149, 255, 0.4)',
      border: '1px solid rgba(0, 149, 255, 0.4)',
      transform: 'translateY(-1px)',
    },
  },

  neonText: {
    textShadow: '0 0 10px rgba(0, 149, 255, 0.5)',
  },

  heroSection: {
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at top right, rgba(0, 149, 255, 0.1) 0%, transparent 60%)',
      pointerEvents: 'none',
    },
  },

  featureIcon: {
    boxShadow: '0 0 20px rgba(0, 149, 255, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.2)',
  },

  gradientBorder: {
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -1,
      left: -1,
      right: -1,
      bottom: -1,
      background: 'linear-gradient(45deg, rgba(0, 149, 255, 0.5), rgba(0, 247, 255, 0.5))',
      borderRadius: theme.radius.md,
      zIndex: -1,
      opacity: 0,
      transition: 'opacity 0.2s ease',
    },
    '&:hover::before': {
      opacity: 1,
    },
  },
}));

const features = [
  {
    icon: IconRocket,
    title: 'Mission Management',
    description: 'Plan and execute astronomical missions with precision and ease',
  },
  {
    icon: IconPhoto,
    title: 'Asset Processing',
    description: 'Process and analyze astronomical imagery and data',
  },
  {
    icon: IconChartBar,
    title: 'Data Analysis',
    description: 'Powerful tools for analyzing mission data and results',
  },
  {
    icon: IconMap,
    title: 'Location Tracking',
    description: 'Track and manage observation locations globally',
  },
  {
    icon: IconCloud,
    title: 'Cloud Storage',
    description: 'Secure cloud storage for all your mission assets',
  },
  {
    icon: IconDatabase,
    title: 'Data Organization',
    description: 'Organize data across organizations, projects, and missions',
  },
];

export function Home() {
  const { classes, cx } = useStyles();
  const navigate = useNavigate();
  const { data: organizations = [], isLoading: orgsLoading } = useOrganizations();
  const { user, isLoading: userLoading } = useCurrentUser();
  
  const isLoading = orgsLoading || userLoading;

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }

  // If user is not set up, show welcome page
  if (!user) {
    return (
      <Box>
        {/* Hero Section */}
        <Box pos="relative" h={rem(600)} className={classes.heroSection}>
          <BackgroundImage
            src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2013&q=80"
            h="100%"
          >
            <Overlay
              gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, .9) 40%)"
              opacity={0.75}
              zIndex={0}
            />
            <Container size="lg" h="100%">
              <Center h="100%">
                <Stack align="center" gap="xl" style={{ zIndex: 1 }}>
                  <Title order={1} size={rem(48)} c="white" ta="center" className={classes.neonText}>
                    Welcome to SkyStore
                  </Title>
                  <Text c="gray.2" size="xl" maw={600} ta="center">
                    Your complete platform for managing astronomical missions, 
                    processing data, and collaborating with your team
                  </Text>
                  <Button
                    size="xl"
                    className={classes.neonButton}
                    onClick={() => navigate('/profile')}
                    leftSection={<IconUser size={20} />}
                  >
                    Get Started
                  </Button>
                </Stack>
              </Center>
            </Container>
          </BackgroundImage>
        </Box>

        {/* Features Section */}
        <Container size="lg" py={rem(80)}>
          <Stack gap={50}>
            <Stack gap="xs" align="center">
              <Title order={2} className={classes.neonText}>Everything You Need</Title>
              <Text c="dimmed" ta="center" maw={600}>
                SkyStore provides all the tools you need to manage your astronomical missions effectively
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={30}>
              {features.map((feature) => (
                <Paper 
                  key={feature.title} 
                  className={cx(classes.glassCard, classes.gradientBorder)}
                  p="md" 
                  radius="md"
                >
                  <Group>
                    <ThemeIcon
                      size={44}
                      radius="md"
                      className={classes.featureIcon}
                    >
                      <feature.icon size={rem(26)} stroke={1.5} />
                    </ThemeIcon>
                    <Box>
                      <Text size="lg" fw={500} mb={5} className={classes.neonText}>
                        {feature.title}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {feature.description}
                      </Text>
                    </Box>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>
    );
  }

  // User dashboard
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Paper 
          className={cx(classes.glassCard, classes.gradientBorder)}
          p="xl" 
          radius="md"
        >
          <Stack gap="xs">
            <Title className={classes.neonText}>Welcome back, {user.name}</Title>
            <Text c="gray.2">Manage your astronomical missions and data</Text>
          </Stack>
        </Paper>

        <Card className={classes.glassCard} shadow="sm">
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Stack gap={0}>
                <Text size="lg" fw={500} className={classes.neonText}>Your Organizations</Text>
                <Text size="sm" c="dimmed">Select an organization to view its projects</Text>
              </Stack>
              <Button
                className={classes.neonButton}
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate('/org/create')}
              >
                Create Organization
              </Button>
            </Group>

            {organizations.length === 0 ? (
              <Card className={classes.glassCard}>
                <Stack align="center" gap="md" py="xl">
                  <ThemeIcon
                    size={60}
                    radius="md"
                    className={classes.featureIcon}
                  >
                    <IconBuildingSkyscraper size={30} />
                  </ThemeIcon>
                  <Text ta="center" fw={500} className={classes.neonText}>No Organizations Yet</Text>
                  <Text ta="center" size="sm" c="dimmed">
                    Create your first organization to start managing projects
                  </Text>
                  <Button
                    className={classes.neonButton}
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
                    className={cx(classes.glassCard, classes.gradientBorder)}
                    padding="lg"
                    radius="md"
                  >
                    <Stack gap="md">
                      <Group>
                        <ThemeIcon
                          size={40}
                          radius="md"
                          className={classes.featureIcon}
                        >
                          <IconBuildingSkyscraper size={24} />
                        </ThemeIcon>
                        <Text fw={500} truncate className={classes.neonText}>{org.name}</Text>
                      </Group>
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {org.description}
                      </Text>
                      <Button
                        className={classes.neonButton}
                        fullWidth
                        onClick={() => navigate(`/org/${org.key}`)}
                      >
                        View Projects
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 