import React from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Stack,
  Card,
  Avatar,
  Group,
  Button,
  TextInput,
  Textarea,
  Divider,
  LoadingOverlay,
  Paper,
} from '@mantine/core';
import { useUser, useUpdateUser } from '../api/hooks/useUser';
import { apiClient } from '../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useCurrentUser } from '../contexts/UserContext';

function CreateUserForm() {
  const queryClient = useQueryClient();
  const { setCurrentUserId } = useCurrentUser();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    company: '',
    website: '',
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const id = crypto.randomUUID();
      const response = await apiClient.createUser({
        ...formData,
        id,
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['users', 'detail', data.id], data);
      setCurrentUserId(data.id);
      notifications.show({
        title: 'Success',
        message: 'User profile created successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create user profile',
        color: 'red',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate();
  };

  return (
    <Container size="md" py="xl">
      <Paper withBorder p="xl" radius="md">
        <Stack gap="xl">
          <div>
            <Title order={2}>Create Your Profile</Title>
            <Text c="dimmed">Set up your user profile to get started</Text>
          </div>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <TextInput
                label="Email"
                placeholder="Enter your email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Textarea
                label="Bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                minRows={3}
              />

              <Group grow>
                <TextInput
                  label="Location"
                  placeholder="Your location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <TextInput
                  label="Company"
                  placeholder="Your company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </Group>

              <TextInput
                label="Website"
                placeholder="Your website URL"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />

              <Button 
                type="submit" 
                loading={createUserMutation.isPending}
                mt="md"
              >
                Create Profile
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}

export function Profile() {
  const { user: currentUser, isLoading, error } = useCurrentUser();
  const updateUserMutation = useUpdateUser();
  const [isEditing, setIsEditing] = React.useState(false);

  const handleSave = () => {
    if (!currentUser) return;
    
    updateUserMutation.mutate({
      id: currentUser.id,
      data: {
        name: currentUser.name,
        email: currentUser.email,
        bio: currentUser.bio,
        location: currentUser.location,
        company: currentUser.company,
        website: currentUser.website,
      }
    }, {
      onSuccess: () => setIsEditing(false)
    });
  };

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  if (error || !currentUser) {
    return <CreateUserForm />;
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={2}>Profile</Title>
          <Text c="dimmed">Manage your personal information</Text>
        </div>

        <Card withBorder>
          <Stack gap="xl">
            <Group>
              <Avatar
                src={currentUser.avatar}
                alt={currentUser.name}
                size="xl"
                radius="xl"
                color="blue"
              >
                {currentUser.name.charAt(0)}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text size="xl" fw={500}>{currentUser.name}</Text>
                <Text size="sm" c="dimmed">{currentUser.email}</Text>
                <Text size="sm" c="dimmed">Member since {new Date(currentUser.joinDate).toLocaleDateString()}</Text>
              </div>
              <Button
                variant="light"
                onClick={() => setIsEditing(!isEditing)}
                loading={updateUserMutation.isPending}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Group>

            {isEditing ? (
              <Stack gap="md">
                <Group grow>
                  <TextInput
                    label="Full Name"
                    value={currentUser.name}
                    onChange={(e) => currentUser.name = e.target.value}
                  />
                  <TextInput
                    label="Email"
                    value={currentUser.email}
                    onChange={(e) => currentUser.email = e.target.value}
                  />
                </Group>

                <Textarea
                  label="Bio"
                  value={currentUser.bio}
                  onChange={(e) => currentUser.bio = e.target.value}
                  minRows={3}
                />

                <Group grow>
                  <TextInput
                    label="Location"
                    value={currentUser.location}
                    onChange={(e) => currentUser.location = e.target.value}
                  />
                  <TextInput
                    label="Company"
                    value={currentUser.company}
                    onChange={(e) => currentUser.company = e.target.value}
                  />
                </Group>

                <TextInput
                  label="Website"
                  value={currentUser.website}
                  onChange={(e) => currentUser.website = e.target.value}
                />

                <Group justify="flex-end">
                  <Button variant="light" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    loading={updateUserMutation.isPending}
                  >
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            ) : (
              <Stack gap="md">
                <div>
                  <Text fw={500}>Bio</Text>
                  <Text size="sm">{currentUser.bio}</Text>
                </div>

                <Divider />

                <Group grow>
                  <div>
                    <Text fw={500}>Location</Text>
                    <Text size="sm">{currentUser.location}</Text>
                  </div>
                  <div>
                    <Text fw={500}>Company</Text>
                    <Text size="sm">{currentUser.company}</Text>
                  </div>
                </Group>

                <div>
                  <Text fw={500}>Website</Text>
                  <Text
                    size="sm"
                    component="a"
                    href={currentUser.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    c="blue"
                  >
                    {currentUser.website}
                  </Text>
                </div>
              </Stack>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 