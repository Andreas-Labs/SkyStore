// Types
export interface Organization {
  id: string;
  key: string;
  name: string;
  description: string;
  metadata: Record<string, string>;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  metadata: Record<string, string>;
}

export interface Mission {
  id: string;
  key: string;
  name: string;
  mission: string;
  location: string;
  date: string;
  metadata: {
    telescope: string;
    target: string;
    exposure_time: string;
    weather_conditions: string;
    observer: string;
    priority: string;
    altitude: string;
    overlap_percent: string;
    sidelap_percent: string;
    ground_resolution: string;
  };
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  missionId: string;
  organization: string;
  project: string;
  mission: string;
  createdAt: string;
  updatedAt: string;
  odmTaskId: string | null;
  progress: number;
  error: string | null;
  imagesCount: number;
  processingTime: number;
  options: Array<{
    name: string;
    value: string | number | boolean;
  }>;
  assets?: {
    all: string;
    orthophoto?: string;
    dsm?: string;
    dtm?: string;
    pointcloud?: string;
    model3d?: string;
    report?: string;
  };
}

export interface CreateTaskPayload {
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  missionId: string;
}

export interface CreateMissionPayload {
  organization: string;
  project: string;
  mission: string;
  name: string;
  location: string;
  date: string;
  metadata: {
    telescope: string;
    target: string;
    exposure_time: string;
    weather_conditions: string;
    observer: string;
    priority: string;
  };
}

export interface Asset {
  id: string;
  originalName: string;
  contentType: string;
  size: number;
  path: string;
  uploadedAt: string;
  presignedUrl: string;
  directUrl: string;
  thumbnailUrl?: string;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  joinDate: string;
  settings: {
    darkMode: boolean;
    accentColor: string;
    notifications: boolean;
    emailNotifications: boolean;
    autoSave: boolean;
    language: string;
    timezone: string;
    mapStyle: string;
  };
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  avatar?: string | null;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
}

export interface UpdateUserSettingsPayload {
  darkMode?: boolean;
  accentColor?: string;
  notifications?: boolean;
  emailNotifications?: boolean;
  autoSave?: boolean;
  language?: string;
  timezone?: string;
  mapStyle?: string;
}

export interface CreateUserPayload {
  id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
}

// API Configuration
const API_URL = 'http://localhost:4000';

// Fetch wrapper with error handling and type safety
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = options.body instanceof FormData
    ? options.headers
    : {
        'Content-Type': 'application/json',
        ...options.headers,
      };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || `HTTP error! status: ${response.status}`);
  }

  // Return the data property from the response if it exists, otherwise return the entire response
  return (json.data !== undefined ? json.data : json) as T;
}

// API Client implementation
export const apiClient = {
  // Organization endpoints
  createOrganization: (id: string, data: Omit<Organization, 'id'>) =>
    apiFetch<Organization>(`/org/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getOrganization: (id: string) =>
    apiFetch<Organization>(`/org/${id}`),

  listOrganizations: () =>
    apiFetch<Organization[]>('/orgs'),

  updateOrganization: (id: string, data: Partial<Omit<Organization, 'id'>>) =>
    apiFetch<Organization>(`/org/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteOrganization: (id: string) =>
    apiFetch<void>(`/org/${id}`, { method: 'DELETE' }),

  // Project endpoints
  createProject: (organization: string, id: string, data: Omit<Project, 'id'>) =>
    apiFetch<Project>(`/org/${organization}/project/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProject: (organization: string, id: string) =>
    apiFetch<Project>(`/org/${organization}/project/${id}`),

  listProjects: (organization: string) =>
    apiFetch<Project[]>(`/org/${organization}/projects`),

  updateProject: (organization: string, id: string, data: Partial<Omit<Project, 'id'>>) =>
    apiFetch<Project>(`/org/${organization}/project/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteProject: (organization: string, id: string) =>
    apiFetch<void>(`/org/${organization}/project/${id}`, { method: 'DELETE' }),

  // Mission endpoints
  createMission: (payload: CreateMissionPayload) => {
    const { organization, project, mission, ...data } = payload;
    return apiFetch<Mission>(
      `/org/${organization}/project/${project}/mission/${mission}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  listMissions: (organization: string, project: string) =>
    apiFetch<Mission[]>(`/org/${organization}/project/${project}/missions`),

  getMission: (organization: string, project: string, mission: string) =>
    apiFetch<Mission>(`/org/${organization}/project/${project}/mission/${mission}`),

  updateMission: (organization: string, project: string, mission: string, data: Partial<Mission>) =>
    apiFetch<Mission>(
      `/org/${organization}/project/${project}/mission/${mission}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    ),

  // Task endpoints
  createTask: (organization: string, project: string, mission: string, data: CreateTaskPayload) =>
    apiFetch<Task>(
      `/org/${organization}/project/${project}/mission/${mission}/tasks`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  listTasks: (organization: string, project: string, mission: string) =>
    apiFetch<Task[]>(`/org/${organization}/project/${project}/mission/${mission}/tasks`),

  updateTask: (organization: string, project: string, mission: string, taskId: string, data: Partial<CreateTaskPayload>) =>
    apiFetch<Task>(
      `/org/${organization}/project/${project}/mission/${mission}/tasks/${taskId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    ),

  deleteTask: (organization: string, project: string, mission: string, taskId: string) =>
    apiFetch<void>(
      `/org/${organization}/project/${project}/mission/${mission}/tasks/${taskId}`,
      { method: 'DELETE' }
    ),

  getTaskStatus: (organization: string, project: string, mission: string, taskId: string) =>
    apiFetch<Task>(`/org/${organization}/project/${project}/mission/${mission}/tasks/${taskId}/status`),

  pauseTask: (organization: string, project: string, mission: string, taskId: string) =>
    apiFetch<Task>(
      `/org/${organization}/project/${project}/mission/${mission}/tasks/${taskId}/pause`,
      { method: 'POST' }
    ),

  resumeTask: (organization: string, project: string, mission: string, taskId: string) =>
    apiFetch<Task>(
      `/org/${organization}/project/${project}/mission/${mission}/tasks/${taskId}/resume`,
      { method: 'POST' }
    ),

  // Asset endpoints
  uploadAsset: (organization: string, project: string, mission: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch<Asset>(
      `/org/${organization}/project/${project}/mission/${mission}/assets/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
  },

  getMissionAssets: (organization: string, project: string, mission: string) =>
    apiFetch<Asset[]>(`/org/${organization}/project/${project}/mission/${mission}/assets`),

  getAsset: (organization: string, project: string, mission: string, assetId: string) =>
    apiFetch<Asset>(`/org/${organization}/project/${project}/mission/${mission}/assets/${assetId}`),

  getThumbnailUrl: (organization: string, project: string, mission: string, assetId: string) =>
    `${API_URL}/org/${organization}/project/${project}/mission/${mission}/assets/${assetId}/thumbnail`,

  getTaskOutput: (organization: string, project: string, mission: string, taskId: string, line: number = 0): Promise<{ data: string[] }> => {
    return apiFetch<{ data: any }>(
      `/org/${organization}/project/${project}/mission/${mission}/tasks/${taskId}/output?line=${line}`,
      {
        method: 'GET',
      }
    );

  },

  // User endpoints
  listUsers: async ({ page = 1, limit = 10 }: ListUsersParams = {}): Promise<User[]> => {
    const response = await fetch(`${API_URL}/user/list?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to list users');
    }
    return response.json();
  },

  createUser: async (data: CreateUserPayload): Promise<User> => {
    const response = await fetch(`${API_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  },

  getUser: async (id: string): Promise<User> => {
    const response = await fetch(`${API_URL}/user/${id}`);
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    return response.json();
  },

  updateUser: async (id: string, data: UpdateUserPayload): Promise<User> => {
    const response = await fetch(`${API_URL}/user/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    return response.json();
  },

  updateUserSettings: async (id: string, data: UpdateUserSettingsPayload): Promise<User> => {
    const response = await fetch(`${API_URL}/user/${id}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update user settings');
    }
    return response.json();
  },

  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/user/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  },
}; 