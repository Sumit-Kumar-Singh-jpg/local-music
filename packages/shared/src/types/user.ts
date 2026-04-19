export enum Role {
  USER = 'USER',
  ARTIST = 'ARTIST',
  ADMIN = 'ADMIN',
}

export enum BillingTier {
  FREE = 'FREE',
  PATRON = 'PATRON',
}

export interface UserSettings {
  audioQuality: 'NORMAL' | 'HIGH' | 'VERY_HIGH' | 'HIFI';
  dataSaver: boolean;
  explicitFilter: boolean;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
}

export interface TasteProfile {
  topGenres: string[];
  danceability: number;
  energy: number;
  acousticness: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: Role;
  billingTier: BillingTier;
  settings?: UserSettings;
  tasteProfile?: TasteProfile;
  socialLinks?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
