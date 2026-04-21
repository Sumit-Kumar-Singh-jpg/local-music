import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePlayerStore, formatTime } from '../store/playerStore'
import { playlistApi, musicApi } from '../lib/api'
import './Playlist.css'

export default function Playlist() {
  const { id } = useParams<{ id: string }>()
  const { play, track: nowTrack, isPlaying } = usePlayerStore()
  const [playlist, setPlaylist] = useState<any>(null)
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (!id) return
    playlistApi.get(id)
      .then(res => {
        setPlaylist(res.playlist)
        setTracks(res.playlist?.tracks || [])
        setLoading(false)
      })
      .catch(() => {
        musicApi.trending().then(res => {
          setPlaylist({ name: 'My Playlist', description: 'Your personal collection curated by Local Music', trackCount: res.tracks.length })
          setTracks(res.tracks)
          setLoading(false)
        }).catch(() => setLoading(false))
      })
  }, [id])

  if (loading) return <div className="fade-in"><p className="text-secondary">Loading playlist...</p></div>

  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0)
  const hours = Math.floor(totalDuration / 3600)
  const mins = Math.floor((totalDuration % 3600) / 60)

  return (
    <div className="playlist-page fade-in">
      <div className="playlist-header">
        <div className="playlist-cover-wrap">
          <img 
            src={playlist?.coverArt || `https://api.dicebear.com/7.x/shapes/svg?seed=${id}`} 
            alt={playlist?.name} 
            className="playlist-cover"
          />
        </div>
        
        <div className="playlist-meta">
          <span className="playlist-type">Playlist</span>
          <h1 className="playlist-name">{playlist?.name || 'My Playlist'}</h1>
          <p className="playlist-description">{playlist?.description || 'Your custom collection of sounds.'}</p>
          
          <div className="playlist-stats">
            <span>{tracks.length} songs</span>
            <div className="dot" />
            <span>{hours > 0 ? `${hours} hr ` : ''}{mins} min</span>
          </div>

          <div className="playlist-actions">
            <button className="btn-play-large btn" onClick={() => tracks.length > 0 && play(tracks[0], tracks)}>
              {nowTrack?.id === tracks[0]?.id && isPlaying ? '⏸' : '▶'} Play
            </button>
            <button className={`btn-glass btn${liked ? ' active-ctrl' : ''}`} onClick={() => setLiked(!liked)}>
              {liked ? '♥ Liked' : '♡ Like'}
            </button>
            <button className="btn-icon">⋯</button>
          </div>
        </div>
      </div>

      <div className="track-list-header">
        <span>#</span>
        <span>Title</span>
        <span>Album</span>
        <span style={{ textAlign: 'right' }}>🕒</span>
      </div>

      <div className="playlist-tracks-list">
        {tracks.map((t, i) => (
          <div 
            key={t.id} 
            className={`playlist-track-row${nowTrack?.id === t.id ? ' playing' : ''}`} 
            onClick={() => play(t, tracks)}
          >
            <span className="track-num">
              {nowTrack?.id === t.id && isPlaying
                ? <div className="playing-bars"><span/><span/><span/></div>
                : i + 1}
            </span>
            
            <div className="track-main">
              <img src={t.cover || `https://api.dicebear.com/7.x/shapes/svg?seed=${t.id}`} alt="" className="track-img" />
              <div className="track-titles">
                <div className="track-name truncate">{t.title}</div>
                <div className="track-artists truncate">{t.artistName || t.artist?.name || t.artist}</div>
              </div>
            </div>

            <div className="track-album truncate">{t.albumTitle || t.album?.title || t.album || 'Single'}</div>
            
            <div className="track-duration">
              {formatTime(t.duration)}
            </div>
          </div>
        ))}
      </div>

      {tracks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <p className="text-secondary">This playlist is currently empty.</p>
        </div>
      )}
    </div>
  )
}
