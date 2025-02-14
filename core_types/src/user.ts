export interface UserSettings {
  darkMode: boolean;
  accentColor: string;
  notifications: boolean;
  emailNotifications: boolean;
  autoSave: boolean;
  language: string;
  timezone: string;
  mapStyle: string;
}

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
  settings: UserSettings;
}

export interface CreateUserBody {
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
}

export interface UpdateUserBody extends Partial<CreateUserBody> {}

export interface UpdateUserSettingsBody extends Partial<UserSettings> {} 