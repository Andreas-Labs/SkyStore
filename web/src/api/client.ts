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
  };
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  // For endpoints that don't return data
  if (response.status === 204) {
    return {} as T;
  }

  return data.data as T;
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
}; 