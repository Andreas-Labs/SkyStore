import React from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Stack,
  Card,
  Switch,
  ColorPicker,
  Slider,
  SegmentedControl,
  Group,
  Button,
  Divider,
  TextInput,
  Select,
  LoadingOverlay,
} from '@mantine/core';
import { useCurrentUser } from '../contexts/UserContext';
import { useUpdateUserSettings } from '../api/hooks/useUser';

export function Settings() {
  const { user: currentUser, isLoading } = useCurrentUser();
  const updateSettingsMutation = useUpdateUserSettings();
  const [settings, setSettings] = React.useState({
    darkMode: true,
    accentColor: '#1971c2',
    notifications: true,
    emailNotifications: true,
    autoSave: true,
    language: 'en',
    timezone: 'UTC',
    mapStyle: 'satellite',
  });

  // Initialize settings from user data
  React.useEffect(() => {
    if (currentUser) {
      setSettings(currentUser.settings);
    }
  }, [currentUser]);

  const handleSave = () => {
    if (!currentUser) return;
    
    updateSettingsMutation.mutate({
      id: currentUser.id,
      data: settings
    });
  };

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container size="md" py="xl">
        <Text>Please create a user profile first</Text>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={2}>Settings</Title>
          <Text c="dimmed">Customize your experience</Text>
        </div>

        <Card withBorder>
          <Stack gap="xl">
            <div>
              <Text fw={500} mb="md">Appearance</Text>
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Text>Dark Mode</Text>
                    <Text size="sm" c="dimmed">Toggle dark/light theme</Text>
                  </div>
                  <Switch 
                    checked={settings.darkMode}
                    onChange={(e) => setSettings({ ...settings, darkMode: e.currentTarget.checked })}
                  />
                </Group>

                <div>
                  <Text size="sm" mb="xs">Accent Color</Text>
                  <ColorPicker
                    format="hex"
                    value={settings.accentColor}
                    onChange={(color) => setSettings({ ...settings, accentColor: color })}
                  />
                </div>

                <div>
                  <Text size="sm" mb="xs">Map Style</Text>
                  <SegmentedControl
                    value={settings.mapStyle}
                    onChange={(value) => setSettings({ ...settings, mapStyle: value })}
                    data={[
                      { label: 'Satellite', value: 'satellite' },
                      { label: 'Streets', value: 'streets' },
                      { label: 'Hybrid', value: 'hybrid' },
                    ]}
                  />
                </div>
              </Stack>
            </div>

            <Divider />

            <div>
              <Text fw={500} mb="md">Notifications</Text>
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Text>Push Notifications</Text>
                    <Text size="sm" c="dimmed">Get notified about important updates</Text>
                  </div>
                  <Switch 
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.currentTarget.checked })}
                  />
                </Group>

                <Group justify="space-between">
                  <div>
                    <Text>Email Notifications</Text>
                    <Text size="sm" c="dimmed">Receive email updates</Text>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.currentTarget.checked })}
                  />
                </Group>
              </Stack>
            </div>

            <Divider />

            <div>
              <Text fw={500} mb="md">Preferences</Text>
              <Stack gap="md">
                <Select
                  label="Language"
                  value={settings.language}
                  onChange={(value) => setSettings({ ...settings, language: value || 'en' })}
                  data={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                  ]}
                />

                <Select
                  label="Timezone"
                  value={settings.timezone}
                  onChange={(value) => setSettings({ ...settings, timezone: value || 'UTC' })}
                  data={[
                    { value: 'UTC', label: 'UTC' },
                    { value: 'EST', label: 'Eastern Time' },
                    { value: 'PST', label: 'Pacific Time' },
                  ]}
                />

                <Group justify="space-between">
                  <div>
                    <Text>Auto-save</Text>
                    <Text size="sm" c="dimmed">Automatically save changes</Text>
                  </div>
                  <Switch 
                    checked={settings.autoSave}
                    onChange={(e) => setSettings({ ...settings, autoSave: e.currentTarget.checked })}
                  />
                </Group>
              </Stack>
            </div>

            <Divider />

            <Group justify="flex-end">
              <Button 
                variant="light" 
                onClick={() => window.history.back()}
                disabled={updateSettingsMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                loading={updateSettingsMutation.isPending}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 