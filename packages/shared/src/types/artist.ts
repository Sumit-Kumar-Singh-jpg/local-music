export interface ArtistProfile {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  image?: string;
  coverImage?: string;
  monthlyListeners: number;
  isVerified: boolean;
  socialLinks?: Record<string, string>;
  monetization?: {
    tipJarUrl?: string;
    merchandiseLinks?: Record<string, string>;
  };
}
