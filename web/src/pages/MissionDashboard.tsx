import React, { useEffect, useState } from 'react';
import { Container, Title, Text, Group, Stack, Card, Button, Loader, Center, FileButton, Progress, Grid } from '@mantine/core';
import { IconUpload, IconInfoCircle, IconPhoto } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, Mission, Asset } from '../api/client';
import { notifications } from '@mantine/notifications';
import { AssetGrid } from '../components/AssetGrid';

export function MissionDashboard() {
  const navigate = useNavigate();
  const { organization, project, mission } = useParams();
  const [missionData, setMissionData] = useState<Mission | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={0}>
            <Title order={2}>{missionData.name}</Title>
            <Text c="dimmed">Mission details and assets</Text>
          </Stack>
          <FileButton onChange={handleFileUpload} accept="image/*,application/fits" multiple>
            {(props) => (
              <Button
                {...props}
                leftSection={<IconUpload size={16} />}
                loading={uploading}
              >
                Upload Assets
              </Button>
            )}
          </FileButton>
        </Group>

        {uploading && (
          <Group align="center" gap="xs">
            <Progress
              value={uploadProgress}
              size="xl"
              radius="xl"
              style={{ flex: 1 }}
            />
            <Text size="sm" w={50} ta="right">{Math.round(uploadProgress)}%</Text>
          </Group>
        )}

        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder>
              <Stack gap="md">
                <Group>
                  <Text fw={500}>Location:</Text>
                  <Text>{missionData.location || 'Not specified'}</Text>
                </Group>
                <Group>
                  <Text fw={500}>Date:</Text>
                  <Text>{missionData.date ? new Date(missionData.date).toLocaleDateString() : 'Not specified'}</Text>
                </Group>
                <Group>
                  <Text fw={500}>Telescope:</Text>
                  <Text>{missionData.metadata.telescope || 'Not specified'}</Text>
                </Group>
                <Group>
                  <Text fw={500}>Target:</Text>
                  <Text>{missionData.metadata.target || 'Not specified'}</Text>
                </Group>
                <Group>
                  <Text fw={500}>Exposure Time:</Text>
                  <Text>{missionData.metadata.exposure_time || 'Not specified'}</Text>
                </Group>
                <Group>
                  <Text fw={500}>Weather Conditions:</Text>
                  <Text>{missionData.metadata.weather_conditions || 'Not specified'}</Text>
                </Group>
                <Group>
                  <Text fw={500}>Observer:</Text>
                  <Text>{missionData.metadata.observer || 'Not specified'}</Text>
                </Group>
                <Group>
                  <Text fw={500}>Priority:</Text>
                  <Text style={{ textTransform: 'capitalize' }}>{missionData.metadata.priority || 'Not specified'}</Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            {assets.length === 0 ? (
              <Card withBorder p="xl">
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
        </Grid>
      </Stack>
    </Container>
  );
} 