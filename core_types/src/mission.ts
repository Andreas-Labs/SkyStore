export interface Mission {
  name: string;
  location: string;
  date: string; // ISO string
  metadata: Record<string, string>;
}

export interface CreateMissionParams {
  organization: string;
  project: string;
  mission: string;
}

export interface CreateMissionBody extends Mission {} 