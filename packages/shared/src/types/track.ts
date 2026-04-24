export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName?: string; // Cache for easy display
  albumId?: string;
  albumTitle?: string; // Cache for easy display
  duration: number;
  isExplicit: boolean;
  cover?: string;      // URL to cover art
  coverUrl?: string;   // Local or specific cover URL
  spotifyId?: string;  // Unique ID for duplicate check
  audioUrl: string;
  hifi?: boolean;      // Whether HiFi is available
  highQualityUrl?: string;
  losslessUrl?: string;
  playCount: number;
  lyricsId?: string;
  bpm?: number;
  key?: string;
  releaseDate: string;
}

export enum AlbumType {
  ALBUM = 'ALBUM',
  SINGLE = 'SINGLE',
  EP = 'EP',
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName?: string;
  coverArt?: string;
  releaseDate: string;
  type: AlbumType;
  tracks?: Track[];
}
