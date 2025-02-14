import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, type Organization, type Project, type Mission, type Asset } from '../client';
import { queryClient } from '../queryClient';

// Query key factory
const keys = {
  organizations: {
    all: ['organizations'] as const,
    lists: () => [...keys.organizations.all, 'list'] as const,
    detail: (id: string) => [...keys.organizations.all, 'detail', id] as const,
  },
  projects: {
    all: ['projects'] as const,
    lists: (orgId: string) => [...keys.projects.all, 'list', orgId] as const,
    detail: (orgId: string, id: string) => [...keys.projects.all, 'detail', orgId, id] as const,
  },
  missions: {
    all: ['missions'] as const,
    lists: (orgId: string, projId: string) => [...keys.missions.all, 'list', orgId, projId] as const,
    detail: (orgId: string, projId: string, id: string) => [...keys.missions.all, 'detail', orgId, projId, id] as const,
  },
  assets: {
    all: ['assets'] as const,
    lists: (orgId: string, projId: string, missId: string) => [...keys.assets.all, 'list', orgId, projId, missId] as const,
    detail: (orgId: string, projId: string, missId: string, id: string) => [...keys.assets.all, 'detail', orgId, projId, missId, id] as const,
  },
};

// Organization hooks
export function useOrganizations() {
  return useQuery({
    queryKey: keys.organizations.lists(),
    queryFn: () => apiClient.listOrganizations(),
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: keys.organizations.detail(id),
    queryFn: () => apiClient.getOrganization(id),
    enabled: Boolean(id),
  });
}

export function useCreateOrganization() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Organization, 'id'> }) =>
      apiClient.createOrganization(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.organizations.lists() });
    },
  });
}

// Project hooks
export function useProjects(organizationId: string) {
  return useQuery({
    queryKey: keys.projects.lists(organizationId),
    queryFn: () => apiClient.listProjects(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useProject(organizationId: string, projectId: string) {
  return useQuery({
    queryKey: keys.projects.detail(organizationId, projectId),
    queryFn: () => apiClient.getProject(organizationId, projectId),
    enabled: Boolean(organizationId && projectId),
  });
}

export function useCreateProject() {
  return useMutation({
    mutationFn: ({ organization, id, data }: { organization: string; id: string; data: Omit<Project, 'id'> }) =>
      apiClient.createProject(organization, id, data),
    onSuccess: (_, { organization }) => {
      queryClient.invalidateQueries({ queryKey: keys.projects.lists(organization) });
    },
  });
}

// Mission hooks
export function useMissions(organizationId: string, projectId: string) {
  return useQuery({
    queryKey: keys.missions.lists(organizationId, projectId),
    queryFn: () => apiClient.listMissions(organizationId, projectId),
    enabled: Boolean(organizationId && projectId),
  });
}

export function useMission(organizationId: string, projectId: string, missionId: string) {
  return useQuery({
    queryKey: keys.missions.detail(organizationId, projectId, missionId),
    queryFn: () => apiClient.getMission(organizationId, projectId, missionId),
    enabled: Boolean(organizationId && projectId && missionId),
  });
}

export function useCreateMission() {
  return useMutation({
    mutationFn: (payload: { organization: string; project: string; mission: string } & Omit<Mission, 'id'>) =>
      apiClient.createMission(payload),
    onSuccess: (_, { organization, project }) => {
      queryClient.invalidateQueries({ queryKey: keys.missions.lists(organization, project) });
    },
  });
}

// Asset hooks
export function useAssets(organizationId: string, projectId: string, missionId: string) {
  return useQuery({
    queryKey: keys.assets.lists(organizationId, projectId, missionId),
    queryFn: () => apiClient.getMissionAssets(organizationId, projectId, missionId),
    enabled: Boolean(organizationId && projectId && missionId),
  });
}

export function useAsset(organizationId: string, projectId: string, missionId: string, assetId: string) {
  return useQuery({
    queryKey: keys.assets.detail(organizationId, projectId, missionId, assetId),
    queryFn: () => apiClient.getAsset(organizationId, projectId, missionId, assetId),
    enabled: Boolean(organizationId && projectId && missionId && assetId),
  });
}

export function useUploadAsset() {
  return useMutation({
    mutationFn: ({ organization, project, mission, file }: { organization: string; project: string; mission: string; file: File }) =>
      apiClient.uploadAsset(organization, project, mission, file),
    onSuccess: (_, { organization, project, mission }) => {
      queryClient.invalidateQueries({ queryKey: keys.assets.lists(organization, project, mission) });
    },
  });
}

export function useGetThumbnailUrl() {
  return (asset: Asset, organization: string, project: string, mission: string) => {
    if (!organization || !project || !mission) return '';
    return apiClient.getThumbnailUrl(organization, project, mission, asset.id);
  };
} 