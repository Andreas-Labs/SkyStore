import React from 'react';
import { 
  SimpleGrid, 
  Card, 
  Image, 
  Text, 
  Group, 
  Stack,
  ActionIcon,
  Tooltip,
  Badge,
  Divider,
} from '@mantine/core';
import { 
  IconDownload, 
  IconTrash, 
  IconEye,
  IconMap,
  IconMountain,
  IconDots,
  Icon3dCubeSphere,
  IconFileReport,
} from '@tabler/icons-react';
import { Asset } from '../../../api/client';

interface AssetGridProps {
  assets: Asset[];
  onView?: (asset: Asset) => void;
  onDownload?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
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

export function AssetGrid({ assets, onView, onDownload, onDelete }: AssetGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      {assets.map((asset) => (
        <Card key={asset.id} withBorder shadow="sm" padding="md" radius="md">
          <Card.Section>
            {asset.thumbnailUrl ? (
              <Image
                src={asset.thumbnailUrl}
                height={160}
                alt={asset.originalName}
                fallbackSrc="https://placehold.co/600x400?text=No+Preview"
              />
            ) : (
              <div style={{ height: 160, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getAssetIcon(asset.contentType)}
              </div>
            )}
          </Card.Section>

          <Stack gap="xs" mt="md">
            <Group justify="space-between" align="start">
              <Text fw={500} truncate>{asset.originalName}</Text>
              <Badge 
                variant="light" 
                color={getAssetColor(asset.contentType)}
                leftSection={getAssetIcon(asset.contentType)}
              >
                {asset.contentType.split('/')[1]}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" lineClamp={2}>
              {`${(asset.size / 1024 / 1024).toFixed(2)} MB`}
            </Text>

            <Divider />

            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                {new Date(asset.uploadedAt).toLocaleDateString()}
              </Text>

              <Group gap="xs">
                {onView && (
                  <Tooltip label="View Asset">
                    <ActionIcon 
                      variant="light" 
                      size="sm" 
                      color="blue"
                      onClick={() => onView(asset)}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
                {onDownload && (
                  <Tooltip label="Download Asset">
                    <ActionIcon 
                      variant="light" 
                      size="sm" 
                      color="green"
                      onClick={() => onDownload(asset)}
                    >
                      <IconDownload size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip label="Delete Asset">
                    <ActionIcon 
                      variant="light" 
                      size="sm" 
                      color="red"
                      onClick={() => onDelete(asset)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Group>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
} 