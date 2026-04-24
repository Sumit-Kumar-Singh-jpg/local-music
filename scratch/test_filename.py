import sys
import os
import re

# Mock Track
class Track:
    def __init__(self):
        self.title = "Test Song"
        self.artists = "Test Artist"
        self.album = "Test Album"
        self.track_number = 1
        self.release_date = "2024-01-01"
        self.duration_ms = 180000
        self.isrc = "TESTISRC"

def sanitize_filename_component(value: str) -> str:
    if not value: return ""
    sanitized = re.sub(r'[<>:"/\\|?*]', lambda m: "'" if m.group() == '"' else '_', value)
    sanitized = re.sub(r'\s+', ' ', sanitized).strip()
    return sanitized

def format_custom_filename(template: str, track, position: int = 1, ext: str = ".flac") -> str:
    year = track.release_date.split("-")[0]
    duration = "03:00"
    replacements = {
        "title": sanitize_filename_component(track.title),
        "artist": sanitize_filename_component(track.artists),
        "album": sanitize_filename_component(track.album),
        "track_number": f"{track.track_number:02d}",
        "track": f"{track.track_number:02d}",
        "date": sanitize_filename_component(track.release_date),
        "year": year,
        "position": f"{position:02d}",
        "isrc": sanitize_filename_component(track.isrc),
        "duration": duration,
    }
    result = template
    for key, value in replacements.items():
        result = result.replace(f"{{{key}}}", value)
    if not result.lower().endswith(ext):
        result += ext
    return re.sub(r'\s+', ' ', result).strip()

track = Track()
print(f"Result: '{format_custom_filename('{title} - {artist}', track)}'")
