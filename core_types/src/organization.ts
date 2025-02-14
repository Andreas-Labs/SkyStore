export interface Organization {
  id: string;
  name: string;
  description: string;
  metadata: Record<string, string>;
}

export interface CreateOrganizationParams {
  organization: string;
}

export interface CreateOrganizationBody extends Organization {}

export interface UpdateOrganizationBody extends Partial<Organization> {} 