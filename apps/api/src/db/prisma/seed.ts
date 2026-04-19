import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SearchService } from '../../services/searchService';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create a few users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  // Create Admins
  const admin1 = await prisma.user.upsert({
    where: { email: 'nischay@localmusic.com' },
    update: {},
    create: {
      email: 'nischay@localmusic.com',
      username: 'nischay',
      passwordHash,
      role: 'ADMIN',
      profile: {
        create: {
          handle: 'nischay',
          displayName: 'Nischay (Admin)',
        }
      }
    }
  });

  const admin2 = await prisma.user.upsert({
    where: { email: 'sumit@localmusic.com' },
    update: {},
    create: {
      email: 'sumit@localmusic.com',
      username: 'sumit',
      passwordHash,
      role: 'ADMIN',
      profile: {
        create: {
          handle: 'sumit',
          displayName: 'Sumit (Admin)',
        }
      }
    }
  });

  // Create standard test Artists
  const user1 = await prisma.user.upsert({
    where: { email: 'artist1@localmusic.com' },
    update: {},
    create: {
      email: 'artist1@localmusic.com',
      username: 'neon_dreamer',
      passwordHash,
      role: 'ARTIST',
      profile: {
        create: {
          handle: 'neon_dreamer',
          displayName: 'Neon Dreamer',
          bio: 'Synthwave producer from the future.',
        }
      }
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'artist2@localmusic.com' },
    update: {},
    create: {
      email: 'artist2@localmusic.com',
      username: 'lofi_vibes',
      passwordHash,
      role: 'ARTIST',
      profile: {
        create: {
          handle: 'lofi_vibes',
          displayName: 'Lo-Fi Vibes',
          bio: 'Chilled beats for studying.',
        }
      }
    }
  });

  // 2. Create Artist Profiles
  const artist1 = await prisma.artistProfile.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      name: 'Neon Dreamer',
      bio: 'Electronic artist specialized in Synthwave and Retrowave.',
      isVerified: true,
      monthlyListeners: 150000,
    }
  });

  await SearchService.indexArtist({
    id: artist1.id,
    name: artist1.name,
    bio: artist1.bio,
    isVerified: artist1.isVerified,
  });

  const artist2 = await prisma.artistProfile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      name: 'Lo-Fi Vibes',
      bio: 'Providing the soundtrack to your focus.',
      isVerified: true,
      monthlyListeners: 850000,
    }
  });

  await SearchService.indexArtist({
    id: artist2.id,
    name: artist2.name,
    bio: artist2.bio,
    isVerified: artist2.isVerified,
  });

  // 3. Create Albums & Tracks
  const album1 = await prisma.album.create({
    data: {
      title: 'Midnight Drive',
      artistId: artist1.id,
      type: 'ALBUM',
      tracks: {
        create: [
          {
            title: 'Electric Horizon',
            duration: 245,
            audioUrl: '/api/media/electric-horizon.mp3',
            isExplicit: false,
            bpm: 110,
            key: 'C# Minor',
            artistId: artist1.id,
          },
          {
            title: 'Grid Runner',
            duration: 198,
            audioUrl: '/api/media/grid-runner.mp3',
            isExplicit: false,
            bpm: 124,
            key: 'A Minor',
            artistId: artist1.id,
          }
        ]
      }
    },
    include: { tracks: true }
  });

  // Index Tracks
  for (const track of album1.tracks) {
    await SearchService.indexTrack({
      id: track.id,
      title: track.title,
      artistName: 'Neon Dreamer',
      albumTitle: album1.title,
      genre: 'Synthwave',
      isExplicit: track.isExplicit,
    });
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
