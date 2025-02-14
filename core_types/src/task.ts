export interface TaskAssets {
  all: string;
  orthophoto?: string;
  dsm?: string;
  dtm?: string;
  pointcloud?: string;
  model3d?: string;
  report?: string;
}

export interface TaskOption {
  name: string;
  value: string | number | boolean;
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
  options: TaskOption[];
  assets?: TaskAssets;
}

export interface CreateTaskParams {
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  missionId: string;
}