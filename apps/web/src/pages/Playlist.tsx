import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { playlistApi, musicApi } from '../lib/api'

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
        // Fallback: use trending 
        musicApi.trending().then(res => {
          setPlaylist({ name: 'My Playlist', description: 'Your collection', trackCount: res.tracks.length })
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
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 40, marginBottom: 40 }}>
        <img src={playlist?.coverArt || 'https://picsum.photos/seed/' + id + '/400/400'} alt={playlist?.name} style={{ width: 220, height: 220, borderRadius: 'var(--radius-2xl)', objectFit: 'cover', boxShadow: 'var(--shadow-glow-secondary)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>Playlist</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>{playlist?.name || 'Playlist'}</h1>
          <p style={{ color: 'var(--color-on-surface-variant)' }}>{playlist?.description || ''}</p>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>
            {tracks.length} songs · {hours > 0 ? `${hours} hr ` : ''}{mins} min
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="btn-play-large btn" onClick={() => tracks.length > 0 && play(tracks[0], tracks)}>▶</button>
            <button className="btn-glass btn" onClick={() => {
              if (tracks.length > 0) {
                const shuffled = [...tracks].sort(() => Math.random() - 0.5)
                play(shuffled[0], shuffled)
              }
            }}>⇄</button>
            <button className={`btn-glass btn${liked ? ' active-ctrl' : ''}`} onClick={() => setLiked(!liked)}>
              {liked ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </div>

      {tracks.map((t, i) => (
        <div key={t.id} className={`track-row${nowTrack?.id === t.id ? ' playing' : ''}`} onClick={() => play(t, tracks)}>
          <span className="track-num">
            {nowTrack?.id === t.id && isPlaying
              ? <div className="playing-bars"><span/><span/><span/></div>
              : i+1}
          </span>
          <img src={t.album?.coverArt || t.cover || 'https://picsum.photos/200'} alt={t.title} className="track-thumb" />
          <div className="track-info">
            <div className="track-title">{t.title}</div>
            <div className="track-artist">{t.artist?.name || playlist?.artist?.name || ''}</div>
          </div>
          <span className="text-secondary" style={{ fontSize: '0.815rem' }}>{t.album?.title || ''}</span>
          <span className="track-duration">{`${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}`}</span>
        </div>
      ))}
    </div>
  )
}
