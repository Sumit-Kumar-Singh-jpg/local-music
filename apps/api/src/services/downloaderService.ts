import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import pLimit from 'p-limit';
import { prisma } from '../db/client';

const limit = pLimit(5);
const DOWNLOAD_PATH = path.join(__dirname, '../../media/music');
const SPOTIFLAC_PATH = path.join(__dirname, '../../../../temp_spotiflac');

export class DownloaderService {
  /**
   * Downloads a song using SpotiFLAC (Spotify Mode)
   */
  static async downloadSpotify(url: string, trackId: string) {
    return limit(async () => {
      console.log(`[Spotify] Queued download for: ${url}`);

      return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
          '-u',
          path.join(SPOTIFLAC_PATH, 'launcher.py'),
          url,
          DOWNLOAD_PATH,
          '--service', 'tidal', 'spoti', 'youtube',
          '--use-track-numbers',
          '--use-artist-subfolders',
          '--use-album-subfolders'
        ]);

        let output = '';
        pythonProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          console.error(`[SpotiFLAC Error] ${data}`);
        });

        pythonProcess.on('close', async (code) => {
          if (code === 0) {
            // Need to find the downloaded file
            // SpotiFLAC organizes them, but for this demo we'll assume it worked
            // in a real scenario, we'd parse the output or use a more deterministic path

            // For now, let's pretend we located it
            const mockFilePath = path.join(DOWNLOAD_PATH, 'downloaded_track.flac');

            await prisma.songStorage.upsert({
              where: { trackId },
              update: { filePath: mockFilePath },
              create: {
                trackId,
                filePath: mockFilePath,
                storageType: 'LOCAL'
              }
            });

            resolve({ success: true, path: mockFilePath });
          } else {
            reject(new Error(`SpotiFLAC failed with code ${code}`));
          }
        });
      });
    });
  }

  /**
   * Downloads a song from an HTTP stream (API Mode)
   */
  static async downloadStream(url: string, trackId: string, filename: string) {
    return limit(async () => {
      console.log(`[API] Queued download for: ${url}`);
      const filePath = path.join(DOWNLOAD_PATH, filename);
      const writer = fs.createWriteStream(filePath);

      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
      });

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', async () => {
          await prisma.songStorage.upsert({
            where: { trackId },
            update: { filePath },
            create: {
              trackId,
              filePath,
              storageType: 'LOCAL'
            }
          });
          resolve({ success: true, path: filePath });
        });
        writer.on('error', reject);
      });
    });
  }

  /**
   * Downloads an entire playlist using SpotiFLAC
   */
  static async downloadPlaylist(url: string) {
    const task = await prisma.ingestionTask.create({
      data: {
        url,
        status: 'RUNNING',
        progress: 0,
      }
    });

    console.log(`[Spotify] Started playlist download: ${url} (Task: ${task.id})`);

    const pythonProcess = spawn('python', [
      '-u',
      path.join(SPOTIFLAC_PATH, 'launcher.py'),
      url,
      DOWNLOAD_PATH,
      '--service', 'tidal', 'spoti', 'youtube',
      '--use-track-numbers',
      '--use-artist-subfolders',
      '--use-album-subfolders'
    ], { env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });

    // Store PID so we can stop it later
    await prisma.ingestionTask.update({
      where: { id: task.id },
      data: { pid: pythonProcess.pid }
    });

    let fullOutput = '';
    pythonProcess.stdout.on('data', async (data) => {
      const line = data.toString();
      fullOutput += line;
      console.log(`[SpotiFLAC] ${line}`);

      // Handle Real-Time Track Insertion
      if (line.includes('[DB_INDEX]')) {
        try {
          const parts = line.split('[DB_INDEX]');
          if (parts.length > 1) {
            const jsonStr = parts[1].trim();
            const tData = JSON.parse(jsonStr);
            // ...

            // Find or create artist safely
            let artist = await prisma.artistProfile.findFirst({ where: { name: tData.artist } });
            if (!artist) {
              const mockUser = await prisma.user.create({ data: { email: `artist_${tData.spotifyId}@sys.loc`, username: `artist_${tData.spotifyId}`, passwordHash: '', role: 'USER' } });
              artist = await prisma.artistProfile.create({ data: { userId: mockUser.id, name: tData.artist } });
            }

            // Insert Track and Storage Mapping
            const track = await prisma.track.create({
              data: {
                title: tData.title,
                artistId: artist.id,
                duration: Math.round(tData.duration / 1000) || 180,
                playCount: 0,
                audioUrl: ''
              }
            });

            await prisma.songStorage.create({
              data: { trackId: track.id, filePath: tData.path, storageType: 'LOCAL' }
            });

            await prisma.track.update({
              where: { id: track.id },
              data: { audioUrl: `/api/songs/${track.id}/stream` }
            });
            console.log(`[Spotify] Indexed Track -> ${tData.title}`);
          } catch (err) {
            console.error(`[DB Error] Failed to parse/insert DB_INDEX: ${err}`);
          }
        }

      // Extract [X/Y] progress
      const progressMatch = line.match(/\[(\d+)\/(\d+)\]/);
        if (progressMatch) {
          const current = parseInt(progressMatch[1]);
          const total = parseInt(progressMatch[2]);
          const percentage = Math.round((current / total) * 100);

          await prisma.ingestionTask.update({
            where: { id: task.id },
            data: {
              progress: percentage,
              completedTracks: current,
              totalTracks: total
            }
          });
        }
      });

    pythonProcess.stderr.on('data', (data) => {
      fullOutput += `ERROR: ${data.toString()}`;
      console.error(`[SpotiFLAC Error] ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      const finalStatus = code === 0 ? 'COMPLETED' : 'FAILED';
      const errorMessage = code !== 0 ? fullOutput.slice(-500) : null;

      await prisma.ingestionTask.update({
        where: { id: task.id },
        data: {
          status: finalStatus,
          progress: code === 0 ? 100 : task.progress,
          error: errorMessage,
          pid: null
        }
      });
      console.log(`[Spotify] Playlist Task ${task.id} finished with status: ${finalStatus}`);
    });

    return task;
  }
}
