
import { prisma } from '../db/client';
import { spawn } from 'child_process';

import path from 'path';
import fs from 'fs';

export class DownloaderService {
  static async downloadPlaylist(url: string) {
    // Determine project root and directories
    const apiDir = process.cwd();
    // Robust resolution: check if temp_spotiflac is in current dir (Docker) or 2 levels up (Local Dev)
    let tempSpotiDir = path.resolve(apiDir, 'temp_spotiflac');
    if (!fs.existsSync(tempSpotiDir)) {
      tempSpotiDir = path.resolve(apiDir, '..', '..', 'temp_spotiflac');
    }
    
    const outputDir = path.resolve(apiDir, 'media', 'music');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create a task record
    const task = await prisma.ingestionTask.create({
      data: {
        url,
        status: 'RUNNING',
        totalTracks: 0,
        completedTracks: 0,
        progress: 0,
      }
    });

    // Python executable and FFMPEG setup
    const isWin = process.platform === 'win32';
    const pythonExecutable = isWin ? 'python' : 'python3';
    const scriptPath = 'launcher.py';
    
    // Use system PATH for FFMPEG, with a fallback for common Windows locations if needed
    // But ideally, ffmpeg should be in the PATH.
    const env = { 
      ...process.env, 
      PYTHONIOENCODING: 'utf-8'
    };

    const pythonProcess = spawn(pythonExecutable, [
      '-u', scriptPath,
      url, outputDir,
      '--service', 'youtube', 'tidal', 'spoti',
      '--use-track-numbers',
      '--filename-format', '{track_number} - {title} - {artist}'
    ], { 
      cwd: tempSpotiDir,
      env
    });

    // Update task with PID
    await prisma.ingestionTask.update({
      where: { id: task.id },
      data: { pid: pythonProcess.pid }
    });

    let fullOutput = '';
    let stdoutBuffer = '';
    
    pythonProcess.stdout.on('data', async (data) => {
      const chunk = data.toString();
      fullOutput += chunk;
      stdoutBuffer += chunk;

      const lines = stdoutBuffer.split(/\r?\n/);
      stdoutBuffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        console.log(`[SpotiFLAC] ${line}`);

        // Handle Real-Time Track Insertion
        if (line.includes('[DB_INDEX]')) {
          try {
            // Use regex to extract the JSON object in case of mixed output
            const match = line.match(/\[DB_INDEX\]\s*(\{.*\})/);
            if (!match) continue;
            
            const tData = JSON.parse(match[1]);

            // --- GATEKEEPER: DEEP INTEGRITY VERIFICATION ---
            if (!tData.path || !fs.existsSync(tData.path)) {
              console.warn(`[Gatekeeper] REJECTED missing file: ${tData.title}`);
              continue;
            }

            const stats = fs.statSync(tData.path);
            let isValid = true;
            let actualGenre = 'Unknown';

            // 1. Minimum Size Check (100KB)
            if (stats.size < 100 * 1024) {
              console.warn(`[Gatekeeper] REJECTED too small (${stats.size} bytes): ${tData.title}`);
              isValid = false;
            }

            // 2. Metadata Parsing Check
            if (isValid) {
              try {
                const mm = await import('music-metadata');
                const metadata = await mm.parseFile(tData.path);
                actualGenre = metadata.common.genre?.[0] || 'Unknown';
              } catch (e) {
                console.warn(`[Gatekeeper] REJECTED corrupted file: ${tData.title}`);
                isValid = false;
              }
            }

            if (!isValid) {
              // Automatically cleanup and trigger rescue for partial/corrupted files
              try { fs.unlinkSync(tData.path); } catch (_e) { /* file already deleted */ }
              console.log(`[Gatekeeper] Triggering YouTube Rescue for: ${tData.title}`);
              const rescueUrl = `https://open.spotify.com/track/${tData.spotifyId}`;
              DownloaderService.downloadPlaylist(rescueUrl).catch(e => console.error(`[Rescue Failed] ${e.message}`));
              continue; // Do NOT index broken tracks
            }

            // Find or create artist safely
            let artist = await prisma.artistProfile.findFirst({ where: { name: tData.artist } });
            if (!artist) {
              const mockUser = await prisma.user.create({ 
                data: { 
                  email: `artist_${tData.spotifyId}_${Date.now()}@sys.loc`, 
                  username: `artist_${tData.spotifyId}_${Date.now()}`, 
                  passwordHash: '', 
                  role: 'USER' 
                } 
              });
              artist = await prisma.artistProfile.create({ data: { userId: mockUser.id, name: tData.artist } });
            }

            // Upsert Track to prevent duplicates by spotifyId
            const track = await prisma.track.upsert({
              where: { spotifyId: tData.spotifyId },
              update: {
                audioUrl: `/api/music/temp/stream`, 
                coverUrl: `/api/music/temp/cover`
              },
              create: {
                title: tData.title,
                artistId: artist.id,
                spotifyId: tData.spotifyId,
                duration: Math.round(tData.duration / 1000) || 180,
                audioUrl: '',
                coverUrl: ''
              }
            });

            // Update URLs and link storage
            await prisma.songStorage.upsert({
              where: { trackId: track.id },
              update: { filePath: tData.path },
              create: { trackId: track.id, filePath: tData.path, storageType: 'LOCAL' }
            });

            await prisma.track.update({
              where: { id: track.id },
              data: { 
                audioUrl: `/api/music/${track.id}/stream`,
                coverUrl: `/api/music/${track.id}/cover`
              }
            });

            // Index into Elasticsearch for immediate discoverability
            try {
              const { SearchService } = await import('./searchService');
              
              await SearchService.indexTrack({
                id: track.id,
                title: track.title,
                artistName: tData.artist,
                albumTitle: tData.album || 'Single',
                genre: actualGenre,
                releaseDate: new Date(),
                isExplicit: false
              });

              // Update track with genre in DB
              await prisma.track.update({
                where: { id: track.id },
                data: { genre: actualGenre }
              });

              console.log(`[Spotify] Indexed Track in Search with Genre (${actualGenre}) -> ${tData.title}`);
            } catch (esErr) {
              console.error(`[Search Index Error] Failed to index ${tData.title}:`, esErr);
            }
            console.log(`[Spotify] Indexed Track -> ${tData.title}`);
            
            // New: Auto-Heal Path for DB consistency
            const cleanedPath = tData.path.replace(/_/g, ' ');
            if (tData.path !== cleanedPath && fs.existsSync(tData.path)) {
              try {
                fs.renameSync(tData.path, cleanedPath);
                await prisma.songStorage.update({
                  where: { trackId: track.id },
                  data: { filePath: cleanedPath }
                });
                console.log(`[Healer] Normalized path for: ${tData.title}`);
              } catch (e: any) {
                console.warn(`[Healer] Failed to rename path: ${e.message}`);
              }
            }
          } catch (err) {
            console.error(`[DB Error] Failed to parse/insert DB_INDEX from line: "${line}". Error: ${err}`);
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
