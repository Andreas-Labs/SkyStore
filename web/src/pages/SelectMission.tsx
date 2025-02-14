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
  Image,
  AspectRatio,
} from '@mantine/core';
import { 
  IconPlus, 
  IconRocket,
  IconChevronLeft,
  IconCalendar,
  IconMapPin,
  IconTelescope,
  IconStar,
  IconPhoto,
  IconMap,
  IconMountain,
  IconDots,
  Icon3dCubeSphere,
  IconFileReport,
} from '@tabler/icons-react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useMissions, useProject, useAssets, useGetThumbnailUrl } from '../api/hooks';
import { Mission } from '../api/client';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_TOKEN) {
  throw new Error('Missing Mapbox access token. Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file');
}

// Add type definition for Vite's import.meta.env
declare global {
  interface ImportMeta {
    env: {
      VITE_MAPBOX_ACCESS_TOKEN: string;
    };
  }
}

function getAssetIcon(contentType: string) {
  switch (contentType.split('/')[1]) {
    case 'orthophoto':
      return <IconMap size={16} />;
    case 'dsm':
    case 'dtm':
      return <IconMountain size={16} />;
    case 'pointcloud':
      return <IconDots size={16} />;
    case 'model3d':
      return <Icon3dCubeSphere size={16} />;
    case 'report':
      return <IconFileReport size={16} />;
    default:
      return null;
  }
}

function getAssetColor(contentType: string) {
  switch (contentType.split('/')[1]) {
    case 'orthophoto':
      return 'green';
    case 'dsm':
      return 'orange';
    case 'dtm':
      return 'yellow';
    case 'pointcloud':
      return 'violet';
    case 'model3d':
      return 'pink';
    case 'report':
      return 'gray';
    default:
      return 'blue';
  }
}

// Helper function to get map thumbnail URL
function getMapThumbnail(location: string) {
  try {
    const [lat, lon] = location.split(',').map(coord => coord.trim());
    return `https://api.mapbox.com/styles/v1/victoryforphil/cm5xshpj600eg01slhyzb1atu/static/${lon},${lat},13,0/600x300?access_token=${MAPBOX_TOKEN}`;
  } catch (e) {
    console.error('Failed to parse location:', e);
    return null;
  }
}

// Helper component for mission card to handle its own assets
function MissionCard({ 
  mission, 
  organization, 
  project, 
  onSelect 
}: { 
  mission: Mission; 
  organization: string; 
  project: string;
  onSelect: () => void;
}) {
  const getThumbnailUrl = useGetThumbnailUrl();
  const { data: assets = [] } = useAssets(organization, project, mission.mission);
  const mapUrl = mission.location ? getMapThumbnail(mission.location) : null;
  const firstAsset = assets[0];

  return (
    <Card 
      key={mission.mission} 
      withBorder
      className="neo-glass home-animate"
      padding="lg"
    >
      <Card.Section>
        <AspectRatio ratio={2}>
          {firstAsset?.thumbnailUrl ? (
            <Image
              src={getThumbnailUrl(firstAsset, organization, project, mission.mission)}
              alt={`Preview of ${mission.name}`}
              fallbackSrc="https://placehold.co/600x300?text=No+Preview"
            />
          ) : mapUrl ? (
            <Image
              src={mapUrl}
              alt={`Location of ${mission.name}`}
              fallbackSrc="https://placehold.co/600x300?text=No+Location+Preview"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <Center bg="dark.6" style={{ height: '100%' }}>
              <ThemeIcon size={40} radius="md" className="glass-icon">
                <IconPhoto size={24} />
              </ThemeIcon>
            </Center>
          )}
        </AspectRatio>
      </Card.Section>

      <Stack gap="md" mt="md">
        <Group>
          <ThemeIcon
            size={40}
            radius="md"
            className="glass-icon"
          >
            <IconRocket size={24} />
          </ThemeIcon>
          <Stack gap={4} style={{ flex: 1 }}>
            <Text fw={500} size="lg" truncate>
              {mission.name}
            </Text>
            <Group gap="xs">
              <Badge size="sm" variant="light">
                {mission.mission}
              </Badge>
            </Group>
          </Stack>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2}>
          Target: {mission.metadata.target}
        </Text>

        <Group gap="xs">
          <Tooltip label="Location">
            <ThemeIcon variant="light" size="sm" radius="sm">
              <IconMapPin size={14} />
            </ThemeIcon>
          </Tooltip>
          <Text size="xs" c="dimmed">{mission.location}</Text>
        </Group>

        <Group gap="xs">
          <Tooltip label="Telescope">
            <ThemeIcon variant="light" size="sm" radius="sm">
              <IconTelescope size={14} />
            </ThemeIcon>
          </Tooltip>
          <Text size="xs" c="dimmed">{mission.metadata.telescope}</Text>
        </Group>

        <Group gap="xs">
          <Tooltip label="Date">
            <ThemeIcon variant="light" size="sm" radius="sm">
              <IconCalendar size={14} />
            </ThemeIcon>
          </Tooltip>
          <Text size="xs" c="dimmed">
            {new Date(mission.date).toLocaleDateString()}
          </Text>
        </Group>

        <Group gap="xs">
          <Tooltip label="Priority">
            <ThemeIcon variant="light" size="sm" radius="sm">
              <IconStar size={14} />
            </ThemeIcon>
          </Tooltip>
          <Text size="xs" c="dimmed">{mission.metadata.priority}</Text>
        </Group>

        <Button
          variant="light"
          fullWidth
          onClick={onSelect}
        >
          Select Mission
        </Button>
      </Stack>
    </Card>
  );
}

export function SelectMission() {
  const navigate = useNavigate();
  const { organization, project } = useParams();
  const getThumbnailUrl = useGetThumbnailUrl();

  // If no organization or project is selected, redirect immediately
  if (!organization || !project) {
    return <Navigate to="/org" replace />;
  }

  // Fetch project to validate it exists
  const { data: projectData, isLoading: projectLoading, error: projectError } = useProject(organization, project);

  // Fetch missions for the project
  const { 
    data: missions = [], 
    isLoading: missionsLoading, 
    error: missionsError,
    refetch 
  } = useMissions(organization, project);

  // Fetch all assets for the current project
  const { data: allAssets = [] } = useAssets(organization, project);

  const isLoading = projectLoading || missionsLoading;
  const error = projectError || missionsError;

  // If project doesn't exist, redirect to project selection
  if (!projectLoading && !projectData) {
    return <Navigate to={`/org/${organization}`} replace />;
  }

  if (isLoading) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="xl">
          <ThemeIcon size={60} radius="md" className="glass-icon glow-effect">
            <IconRocket size={30} />
          </ThemeIcon>
          <Text size="xl" fw={500}>Loading missions...</Text>
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
                <IconRocket size={30} />
              </ThemeIcon>
              <Text ta="center" size="xl" fw={500} c="red">Error Loading Missions</Text>
              <Text ta="center" c="dimmed" maw={400}>
                {error instanceof Error ? error.message : 'Failed to load missions'}
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
                  onClick={() => navigate(`/org/${organization}`)}
                  leftSection={<IconChevronLeft size={16} />}
                >
                  Change Project
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
              {projectData?.name}
            </Title>
            <Text size="lg" c="dimmed" ta="center">
              Select a mission or create a new one
            </Text>
          </Stack>

          <Stack gap="xl">
            <Group justify="space-between" align="center">
              <Button
                variant="subtle"
                onClick={() => navigate(`/org/${organization}`)}
                leftSection={<IconChevronLeft size={16} />}
              >
                Change Project
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate(`/org/${organization}/project/${project}/mission/create`)}
              >
                Create Mission
              </Button>
            </Group>

            {missions.length === 0 ? (
              <Card withBorder className="neo-glass">
                <Stack align="center" gap="md" py="xl">
                  <ThemeIcon
                    size={60}
                    radius="md"
                    className="glass-icon"
                  >
                    <IconRocket size={30} />
                  </ThemeIcon>
                  <Text ta="center" fw={500} size="xl">No Missions Yet</Text>
                  <Text ta="center" size="sm" c="dimmed" maw={400}>
                    Create your first mission to start collecting astronomical data
                  </Text>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => navigate(`/org/${organization}/project/${project}/mission/create`)}
                  >
                    Create Mission
                  </Button>
                </Stack>
              </Card>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {missions.map((mission) => (
                  <MissionCard
                    key={mission.mission}
                    mission={mission}
                    organization={organization}
                    project={project}
                    onSelect={() => navigate(`/org/${organization}/project/${project}/mission/${mission.mission}`)}
                  />
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
} 