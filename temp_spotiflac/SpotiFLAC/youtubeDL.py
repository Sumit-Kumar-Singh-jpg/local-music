import os
import re
import requests
import yt_dlp
from typing import Callable
from urllib.parse import quote
from mutagen.id3 import ID3, ID3NoHeaderError, TIT2, TPE1, TALB, TPE2, TDRC, TRCK, TPOS, APIC, TPUB, WXXX, COMM
from mutagen.mp3 import MP3
from mutagen.mp4 import MP4, MP4Cover

def sanitize_filename(value: str) -> str:
    return re.sub(r'[\\/*?:"<>|]', "", value).strip()

def safe_int(value) -> int:
    try:
        return int(value)
    except (ValueError, TypeError):
        return 0

class YouTubeDownloader:
    def __init__(self, timeout: float = 120.0):
        self.session = requests.Session()
        self.session.timeout = timeout
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        })
        self.progress_callback: Callable[[int, int], None] = None

    def set_progress_callback(self, callback: Callable[[int, int], None]) -> None:
        self.progress_callback = callback

    def get_youtube_url_from_spotify(self, spotify_track_id: str, track_name: str = None, artist_name: str = None) -> str:
        print("Fetching YouTube URL via Songlink HTML...")
        url = f"https://song.link/s/{spotify_track_id}"
        headers = {"User-Agent": "Mozilla/5.0"}
        try:
            resp = self.session.get(url, headers=headers, timeout=10)
            resp.raise_for_status()
            match = re.search(r'https://(?:music\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})', resp.text)
            if match:
                video_id = match.group(1)
                return f"https://music.youtube.com/watch?v={video_id}"
        except Exception:
            pass

        print("Starting direct YouTube search (Fallback)...")
        query = quote(f"{track_name} {artist_name} audio")
        search_url = f"https://www.youtube.com/results?search_query={query}"
        try:
            resp = self.session.get(search_url, timeout=10)
            match = re.search(r'"videoId":"([a-zA-Z0-9_-]{11})"', resp.text)
            if match:
                return f"https://music.youtube.com/watch?v={match.group(1)}"
        except Exception:
            pass
        raise Exception("Failed to resolve YouTube URL")

    def _extract_video_id(self, url: str) -> str:
        match = re.search(r'(?:v=|/v/|youtu\.be/|/embed/)([a-zA-Z0-9_-]{11})', url)
        return match.group(1) if match else None

    def _ytdlp_download(self, video_id: str, output_path: str):
        print(f"Downloading via yt-dlp: {video_id}...")
        ydl_opts = {
            'format': 'bestaudio[ext=m4a]/bestaudio',
            'outtmpl': f"{output_path}.%(ext)s",
            'quiet': True,
            'no_warnings': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f'https://www.youtube.com/watch?v={video_id}', download=True)
            return ydl.prepare_filename(info)

    def download_by_spotify_id(self, spotify_track_id, **kwargs):
        output_dir = kwargs.get("output_dir", ".")
        os.makedirs(output_dir, exist_ok=True)
        yt_url = self.get_youtube_url_from_spotify(spotify_track_id, kwargs.get("spotify_track_name"), kwargs.get("spotify_artist_name"))
        video_id = self._extract_video_id(yt_url)
        
        safe_title = sanitize_filename(kwargs.get("spotify_track_name", "Unknown"))
        safe_artist = sanitize_filename(kwargs.get("spotify_artist_name", "Unknown").split(",")[0])
        base_path = os.path.join(output_dir, f"{safe_artist} - {safe_title}")
        
        # Try direct yt-dlp first as it's most reliable
        try:
            final_path = self._ytdlp_download(video_id, base_path)
            self.embed_metadata(final_path, **kwargs)
            return final_path
        except Exception as e:
            print(f"yt-dlp failed: {e}")
            raise e

    def embed_metadata(self, filepath, **kwargs):
        print(f"Embedding metadata: {os.path.basename(filepath)}")
        title = kwargs.get("spotify_track_name")
        artist = kwargs.get("spotify_artist_name")
        album = kwargs.get("spotify_album_name")
        date = kwargs.get("spotify_release_date")
        cover_url = kwargs.get("spotify_cover_url")

        if filepath.endswith('.m4a') or filepath.endswith('.mp4'):
            try:
                audio = MP4(filepath)
                audio['\xa9nam'] = [str(title)]
                audio['\xa9ART'] = [str(artist)]
                audio['\xa9alb'] = [str(album)]
                audio['\xa9day'] = [str(date)]
                if cover_url:
                    try:
                        r = self.session.get(cover_url, timeout=10)
                        if r.status_code == 200:
                            audio['covr'] = [MP4Cover(r.content, imageformat=MP4Cover.FORMAT_JPEG)]
                    except: pass
                audio.save()
                print("M4A Metadata embedded")
            except Exception as e: print(f"M4A Tag error: {e}")
        else:
            try:
                try:
                    audio = ID3(filepath)
                    audio.delete()
                except ID3NoHeaderError:
                    audio = ID3()
                audio.add(TIT2(encoding=3, text=str(title)))
                audio.add(TPE1(encoding=3, text=str(artist)))
                audio.add(TALB(encoding=3, text=str(album)))
                if date: audio.add(TDRC(encoding=3, text=str(date)))
                if cover_url:
                    try:
                        r = self.session.get(cover_url, timeout=10)
                        if r.status_code == 200:
                            audio.add(APIC(encoding=3, mime='image/jpeg', type=3, desc='Cover', data=r.content))
                    except: pass
                audio.save(filepath, v2_version=3)
                print("MP3 Metadata embedded")
            except Exception as e: print(f"MP3 Tag error: {e}")