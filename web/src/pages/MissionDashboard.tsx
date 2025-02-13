import React, { useEffect, useState } from 'react';
import { Container, Title, Text, Group, Stack, Card, Button, Loader, Center, FileButton, Progress, Grid, Badge, Divider, ScrollArea } from '@mantine/core';
import { IconUpload, IconInfoCircle, IconPhoto, IconCalendar, IconMap, IconTelescope, IconTarget, IconClock, IconCloud, IconUser, IconFlag, IconChecklist, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, Mission, Asset, Task } from '../api/client';
import { notifications } from '@mantine/notifications';
import { AssetGrid } from '../components/AssetGrid';
import { LocationPicker } from '../components/LocationPicker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TaskCard } from '../components/TaskCard';

export function MissionDashboard() {
  const navigate = useNavigate();
  const { organization, project, mission } = useParams();
  const [missionData, setMissionData] = useState<Mission | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  // Add tasks query
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', organization, project, mission],
    queryFn: () => {
      if (!organization || !project || !mission) throw new Error('Missing parameters');
      return apiClient.listTasks(organization, project, mission);
    },
    enabled: Boolean(organization && project && mission)
  });

  useEffect(() => {
    if (organization && project && mission) {
      loadMission();
      loadAssets();
    }
  }, [organization, project, mission]);

  const loadMission = async () => {
    if (!organization || !project || !mission) return;

    try {
      setLoading(true);
      const data = await apiClient.getMission(organization, project, mission);
      setMissionData(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load mission',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    if (!organization || !project || !mission) return;

    try {
      const data = await apiClient.getMissionAssets(organization, project, mission);
      setAssets(data || []);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load assets',
        color: 'red',
      });
    }
  };

  const handleFileUpload = async (files: File[] | null) => {
    if (!files || !organization || !project || !mission) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await apiClient.uploadAsset(organization, project, mission, file);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      notifications.show({
        title: 'Success',
        message: `${files.length} asset${files.length === 1 ? '' : 's'} uploaded successfully`,
        color: 'green',
      });

      await loadAssets();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to upload assets',
        color: 'red',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getThumbnailUrl = (asset: Asset) => {
    if (!organization || !project || !mission) return '';
    return apiClient.getThumbnailUrl(organization, project, mission, asset.id);
  };

  if (loading) {
    return (
      <Center h="100%">
        <Loader size="xl" />
      </Center>
    );
  }

  if (!missionData) {
    return (
      <Container size="lg" py="xl">
        <Card withBorder p="xl">
          <Stack align="center" gap="md">
            <IconInfoCircle size={48} opacity={0.5} />
            <Text ta="center" size="lg" fw={500}>Mission Not Found</Text>
            <Text ta="center" c="dimmed">
              The requested mission could not be found
            </Text>
            <Button
              variant="light"
              onClick={() => navigate(`/org/${organization}/project/${project}`)}
            >
              Back to Project
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={2}>{missionData?.name || 'Mission Dashboard'}</Title>
          <Group>
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="light"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
            >
              Refresh
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate(`/org/${organization}/project/${project}/mission/${mission}/tasks`)}
            >
              Create Task
            </Button>
            <FileButton onChange={handleFileUpload} accept="image/*" multiple>
              {(props) => (
                <Button
                  {...props}
                  leftSection={<IconUpload size={20} />}
                  loading={uploading}
                  disabled={uploading}
                >
                  Upload Assets
                </Button>
              )}
            </FileButton>
          </Group>
        </Group>

        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text c="dimmed" size="sm">Mission details and assets</Text>
          </Stack>
        </Group>

        {uploading && (
          <Card withBorder>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Uploading Assets...</Text>
              <Group align="center" gap="xs">
                <Progress
                  value={uploadProgress}
                  size="xl"
                  radius="xl"
                  style={{ flex: 1 }}
                />
                <Text size="sm" w={50} ta="right">{Math.round(uploadProgress)}%</Text>
              </Group>
            </Stack>
          </Card>
        )}

        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder>
              <Stack gap="lg">
                <Group wrap="nowrap">
                  <IconCalendar size={20} style={{ flexShrink: 0 }} />
                  <Stack gap={0}>
                    <Text fw={500}>Date</Text>
                    <Text size="sm" c="dimmed">
                      {missionData.date ? new Date(missionData.date).toLocaleDateString() : 'Not specified'}
                    </Text>
                  </Stack>
                </Group>

                <Group wrap="nowrap">
                  <IconMap size={20} style={{ flexShrink: 0 }} />
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Text fw={500}>Location</Text>
                    {missionData.location ? (
                      <LocationPicker
                        value={missionData.location}
                        onChange={() => {}} // Read-only in dashboard
                      />
                    ) : (
                      <Text size="sm" c="dimmed">Not specified</Text>
                    )}
                  </Stack>
                </Group>

                <Divider />

                <Group wrap="nowrap">
                  <IconTelescope size={20} style={{ flexShrink: 0 }} />
                  <Stack gap={0}>
                    <Text fw={500}>Telescope</Text>
                    <Text size="sm" c="dimmed">{missionData.metadata.telescope || 'Not specified'}</Text>
                  </Stack>
                </Group>

                <Group wrap="nowrap">
                  <IconTarget size={20} style={{ flexShrink: 0 }} />
                  <Stack gap={0}>
                    <Text fw={500}>Target</Text>
                    <Text size="sm" c="dimmed">{missionData.metadata.target || 'Not specified'}</Text>
                  </Stack>
                </Group>

                <Group wrap="nowrap">
                  <IconClock size={20} style={{ flexShrink: 0 }} />
                  <Stack gap={0}>
                    <Text fw={500}>Exposure Time</Text>
                    <Text size="sm" c="dimmed">{missionData.metadata.exposure_time || 'Not specified'}</Text>
                  </Stack>
                </Group>

                <Divider />

                <Group wrap="nowrap">
                  <IconCloud size={20} style={{ flexShrink: 0 }} />
                  <Stack gap={0}>
                    <Text fw={500}>Weather Conditions</Text>
                    <Text size="sm" c="dimmed">{missionData.metadata.weather_conditions || 'Not specified'}</Text>
                  </Stack>
                </Group>

                <Group wrap="nowrap">
                  <IconUser size={20} style={{ flexShrink: 0 }} />
                  <Stack gap={0}>
                    <Text fw={500}>Observer</Text>
                    <Text size="sm" c="dimmed">{missionData.metadata.observer || 'Not specified'}</Text>
                  </Stack>
                </Group>

                <Group wrap="nowrap">
                  <IconFlag size={20} style={{ flexShrink: 0 }} />
                  <Stack gap={0}>
                    <Text fw={500}>Priority</Text>
                    <Badge 
                      variant="light"
                      color={
                        missionData.metadata.priority === 'high' ? 'red' :
                        missionData.metadata.priority === 'medium' ? 'yellow' :
                        'blue'
                      }
                    >
                      {missionData.metadata.priority || 'Not specified'}
                    </Badge>
                  </Stack>
                </Group>

                <Divider />

                <Group wrap="nowrap">
                  <IconTarget size={20} style={{ flexShrink: 0 }} />
                  <Stack gap={0}>
                    <Text fw={500}>Altitude</Text>
                    <Text size="sm" c="dimmed">{missionData.metadata.altitude || 'Not specified'}</Text>
                  </Stack>
                </Group>

                <Group wrap="nowrap">
                  <IconTarget size={20} style={{ flexShrink: 0 }} />
                  <Stack gap={0}>
                    <Text fw={500}>Overlap %</Text>
                    <Text size="sm" c="dimmed">{missionData.metadata.overlap_percent || 'Not specified'}</Text>
                  </Stack>
                </Group>

                <Group wrap="nowrap">
                  <IconTarget size={20} style={{ flexShrink: 0 }} />
                  <Stack gap={0}>
                    <Text fw={500}>Sidelap %</Text>
                    <Text size="sm" c="dimmed">{missionData.metadata.sidelap_percent || 'Not specified'}</Text>
                  </Stack>
                </Group>

                <Group wrap="nowrap">
                  <IconTarget size={20} style={{ flexShrink: 0 }} />
                  <Stack gap={0}>
                    <Text fw={500}>Ground Resolution</Text>
                    <Text size="sm" c="dimmed">{missionData.metadata.ground_resolution || 'Not specified'}</Text>
                  </Stack>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            {assets.length === 0 ? (
              <Card withBorder p="xl" h="100%">
                <Stack align="center" gap="md">
                  <IconPhoto size={48} opacity={0.5} />
                  <Text ta="center" size="lg" fw={500}>No Assets Yet</Text>
                  <Text ta="center" c="dimmed">
                    Upload your first observation data or image to get started
                  </Text>
                  <FileButton onChange={handleFileUpload} accept="image/*,application/fits" multiple>
                    {(props) => (
                      <Button
                        {...props}
                        variant="light"
                        leftSection={<IconUpload size={16} />}
                        loading={uploading}
                      >
                        Upload Assets
                      </Button>
                    )}
                  </FileButton>
                </Stack>
              </Card>
            ) : (
              <AssetGrid
                assets={assets}
                organization={organization || ''}
                project={project || ''}
                mission={mission || ''}
                getThumbnailUrl={getThumbnailUrl}
              />
            )}
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder>
              <Stack gap="md">
                <Group gap="xs">
                  <IconChecklist size={20} />
                  <Text fw={500}>Processing Tasks</Text>
                  <Text size="sm" c="dimmed">({tasks.length})</Text>
                </Group>
                <ScrollArea h="calc(100vh - 200px)" type="auto">
                  <Stack gap="md">
                    {tasksLoading ? (
                      <Center>
                        <Loader size="sm" />
                      </Center>
                    ) : tasks.length === 0 ? (
                      <Text c="dimmed" ta="center" size="sm">No tasks yet</Text>
                    ) : (
                      tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))
                    )}
                  </Stack>
                </ScrollArea>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
} 