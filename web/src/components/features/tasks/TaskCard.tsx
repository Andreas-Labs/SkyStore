import React from 'react';
import { 
  Card, 
  Text, 
  Badge, 
  Progress, 
  Group, 
  Stack,
  ActionIcon,
  Tooltip,
  Collapse,
  Divider,
  Code,
  ScrollArea,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { apiClient, Task } from '../../../api/client';
import { 
  IconPlayerPlay, 
  IconPlayerPause,
  IconTrash,
  IconRefresh,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconStack,
  IconDownload,
  Icon3dCubeSphere,
  IconFileReport,
  IconMountain,
  IconDots,
  IconRotate,
} from '@tabler/icons-react';

function getStatusColor(status: Task['status']) {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'in_progress':
      return 'blue';
    case 'completed':
      return 'green';
    case 'failed':
      return 'red';
    default:
      return 'gray';
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const { organization, project, mission } = useParams();
  const queryClient = useQueryClient();

  // Poll for task status updates
  const { data: taskStatus } = useQuery({
    queryKey: ['task-status', task.id],
    queryFn: async () => {
      if (!organization || !project || !mission) throw new Error('Missing parameters');
      const response = await apiClient.getTaskStatus(organization, project, mission, task.id);
      return response;
    },
    enabled: Boolean(organization && project && mission && task.status === 'in_progress'),
    refetchInterval: task.status === 'in_progress' ? 5000 : false,
  });
 
  // Get console output
  const { data: consoleOutput, refetch: refetchLogs } = useQuery({
    queryKey: ['task-output', task.id],
    queryFn: async () => {
      if (!organization || !project || !mission) throw new Error('Missing parameters');
      const response = await apiClient.getTaskOutput(organization, project, mission, task.id, 0);
      // Handle the response data which could be a string or array
      const outputText = JSON.parse(response[0]);
      return outputText;
    },
    enabled: Boolean(organization && project && mission),
    refetchInterval: false, // Disable auto-polling
  });

  // Mutations for pause/resume
  const pauseTaskMutation = useMutation({
    mutationFn: () => {
      if (!organization || !project || !mission) throw new Error('Missing parameters');
      return apiClient.pauseTask(organization, project, mission, task.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-status', task.id] });
      notifications.show({
        title: 'Success',
        message: 'Task paused successfully',
        color: 'yellow',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to pause task',
        color: 'red',
      });
    },
  });

  const resumeTaskMutation = useMutation({
    mutationFn: () => {
      if (!organization || !project || !mission) throw new Error('Missing parameters');
      return apiClient.resumeTask(organization, project, mission, task.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-status', task.id] });
      notifications.show({
        title: 'Success',
        message: 'Task resumed successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to resume task',
        color: 'red',
      });
    },
  });

  // Use the latest task data
  const currentTask = taskStatus || task;
  const isProcessing = currentTask.status === 'in_progress';
  const isPaused = currentTask.status === 'pending';
  const isCompleted = currentTask.status === 'completed';

  return (
    <Card withBorder shadow="sm" padding="md" radius="md">
      <Stack gap="xs">
        <Group justify="space-between" mb="xs">
          <Group>
            <Text fw={500} size="lg" truncate>{currentTask.name}</Text>
            <Badge 
              variant="light" 
              color={getStatusColor(currentTask.status)}
              leftSection={currentTask.status === 'in_progress' ? <IconRotate size={12} className="rotating" /> : null}
            >
              {currentTask.status}
            </Badge>
          </Group>
          <ActionIcon 
            variant="subtle" 
            onClick={toggle}
            aria-label="Toggle details"
          >
            {opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </ActionIcon>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={opened ? undefined : 2}>
          {currentTask.description}
        </Text>

        {isProcessing && (
          <Stack gap="xs">
            <Progress 
              value={currentTask.progress} 
              size="sm" 
              color={currentTask.progress === 100 ? 'green' : 'blue'}
              striped 
              animated
            />
            <Text size="xs" c="dimmed" ta="right">{Math.round(currentTask.progress)}%</Text>
          </Stack>
        )}

        <Collapse in={opened}>
          <Stack gap="md" mt="md">
            <Divider />
            
            <Stack gap="xs">
              <Text size="sm" fw={500}>Task Details</Text>
              <Group gap="xs">
                <IconClock size={14} />
                <Text size="sm" fw={500}>Created:</Text>
                <Text size="sm" c="dimmed">{new Date(currentTask.createdAt).toLocaleString()}</Text>
              </Group>
              <Group gap="xs">
                <IconClock size={14} />
                <Text size="sm" fw={500}>Last Updated:</Text>
                <Text size="sm" c="dimmed">{new Date(currentTask.updatedAt).toLocaleString()}</Text>
              </Group>
              {currentTask.odmTaskId && (
                <>
                  <Group gap="xs">
                    <IconStack size={14} />
                    <Text size="sm" fw={500}>Images:</Text>
                    <Text size="sm" c="dimmed">{currentTask.imagesCount || 'N/A'}</Text>
                  </Group>
                  <Group gap="xs">
                    <IconClock size={14} />
                    <Text size="sm" fw={500}>Processing Time:</Text>
                    <Text size="sm" c="dimmed">
                      {currentTask.processingTime ? formatDuration(currentTask.processingTime) : 'N/A'}
                    </Text>
                  </Group>
                </>
              )}
              {currentTask.error && (
                <Text size="sm" c="red">Error: {currentTask.error}</Text>
              )}
            </Stack>

            {/* Console Output Section */}
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Console Output</Text>
                <Group gap="xs">
                  <Button 
                    variant="subtle" 
                    size="xs"
                    leftSection={<IconRefresh size={14} />}
                    onClick={() => refetchLogs()}
                  >
                    Refresh
                  </Button>
                </Group>
              </Group>
              <ScrollArea h={200} type="auto">
                <Code block>
                  {consoleOutput && consoleOutput.length > 0 ? (
                    consoleOutput.map((line: string, index: number) => (
                      <Text key={index} size="xs" style={{ whiteSpace: 'pre-wrap' }}>{line}</Text>
                    ))
                  ) : (
                    <Text size="xs" c="dimmed" fs="italic">No output available.</Text>
                  )}
                </Code>
              </ScrollArea>
            </Stack>

            {isCompleted && currentTask.assets && (
              <Stack gap="xs">
                <Text size="sm" fw={500}>Results</Text>
                <Group>
                  <Tooltip label="Download All Results">
                    <Button
                      component="a"
                      href={currentTask.assets.all}
                      download
                      variant="light"
                      size="xs"
                      leftSection={<IconDownload size={14} />}
                      color="blue"
                    >
                      All Results
                    </Button>
                  </Tooltip>
                  {currentTask.assets.orthophoto && (
                    <Tooltip label="Download Orthophoto">
                      <Button
                        component="a"
                        href={currentTask.assets.orthophoto}
                        download
                        variant="light"
                        size="xs"
                        leftSection={<IconMap size={14} />}
                        color="green"
                      >
                        Orthophoto
                      </Button>
                    </Tooltip>
                  )}
                  {currentTask.assets.dsm && (
                    <Tooltip label="Download DSM">
                      <Button
                        component="a"
                        href={currentTask.assets.dsm}
                        download
                        variant="light"
                        size="xs"
                        leftSection={<IconMountain size={14} />}
                        color="orange"
                      >
                        DSM
                      </Button>
                    </Tooltip>
                  )}
                  {currentTask.assets.dtm && (
                    <Tooltip label="Download DTM">
                      <Button
                        component="a"
                        href={currentTask.assets.dtm}
                        download
                        variant="light"
                        size="xs"
                        leftSection={<IconMountain size={14} />}
                        color="yellow"
                      >
                        DTM
                      </Button>
                    </Tooltip>
                  )}
                  {currentTask.assets.pointcloud && (
                    <Tooltip label="Download Point Cloud">
                      <Button
                        component="a"
                        href={currentTask.assets.pointcloud}
                        download
                        variant="light"
                        size="xs"
                        leftSection={<IconDots size={14} />}
                        color="violet"
                      >
                        Point Cloud
                      </Button>
                    </Tooltip>
                  )}
                  {currentTask.assets.model3d && (
                    <Tooltip label="Download 3D Model">
                      <Button
                        component="a"
                        href={currentTask.assets.model3d}
                        download
                        variant="light"
                        size="xs"
                        leftSection={<Icon3dCubeSphere size={14} />}
                        color="pink"
                      >
                        3D Model
                      </Button>
                    </Tooltip>
                  )}
                  {currentTask.assets.report && (
                    <Tooltip label="Download Report">
                      <Button
                        component="a"
                        href={currentTask.assets.report}
                        download
                        variant="light"
                        size="xs"
                        leftSection={<IconFileReport size={14} />}
                        color="gray"
                      >
                        Report
                      </Button>
                    </Tooltip>
                  )}
                </Group>
              </Stack>
            )}
          </Stack>
        </Collapse>

        <Divider />

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            ID: {currentTask.id.slice(0, 8)}
          </Text>

          <Group gap="xs">
            {isPaused && (
              <Tooltip label="Resume Processing">
                <ActionIcon 
                  variant="light" 
                  size="sm" 
                  color="green"
                  onClick={() => resumeTaskMutation.mutate()}
                  loading={resumeTaskMutation.isPending}
                >
                  <IconPlayerPlay size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {isProcessing && (
              <Tooltip label="Pause Processing">
                <ActionIcon 
                  variant="light" 
                  size="sm" 
                  color="yellow"
                  onClick={() => pauseTaskMutation.mutate()}
                  loading={pauseTaskMutation.isPending}
                >
                  <IconPlayerPause size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label="Delete Task">
              <ActionIcon variant="light" size="sm" color="red">
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
} 