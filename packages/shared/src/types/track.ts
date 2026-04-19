export interface Track {
  id: string;
  title: string;
  artistId: string;
  albumId?: string;
  duration: number;
  isExplicit: boolean;
  audioUrl: string;
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
  coverArt?: string;
  releaseDate: string;
  type: AlbumType;
}
