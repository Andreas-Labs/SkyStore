export interface Project {
  name: string;
  description: string;
  metadata: Record<string, string>;
}

export interface CreateProjectParams {
  organization: string;
  project: string;
}

export interface CreateProjectBody extends Project {}

export interface UpdateProjectBody extends Partial<Project> {} 