import { prisma } from '../db/client';
import { SongStorage } from '@prisma/client';

const storageCache = new Map<string, SongStorage>();


export class MusicService {
  static async getTrending(limit = 20) {
    return prisma.track.findMany({
      take: limit,
      orderBy: {
        playCount: 'desc',
      },
      include: {
        artist: true,
        album: true,
      },
    });
  }

  static async getNewReleases(limit = 20) {
    return prisma.track.findMany({
      take: limit,
      orderBy: {
        releaseDate: 'desc',
      },
      include: {
        artist: true,
        album: true,
      },
    });
  }

  static async getTrackById(id: string) {
    return prisma.track.findUnique({
      where: { id },
      include: {
        artist: true,
        album: true,
      },
    });
  }

  static async incrementPlayCount(id: string) {
    return prisma.track.update({
      where: { id },
      data: {
        playCount: {
          increment: 1,
        },
      },
    });
  }

  static async getStorageCached(trackId: string): Promise<SongStorage | null> {
    const cached = storageCache.get(trackId);
    if (cached) return cached;

    const storage = await prisma.songStorage.findUnique({
      where: { trackId }
    });

    if (storage) {
      storageCache.set(trackId, storage);
    }
    return storage;
  }
}
