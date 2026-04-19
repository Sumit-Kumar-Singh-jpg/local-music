import { prisma } from '../db/client';

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
}
