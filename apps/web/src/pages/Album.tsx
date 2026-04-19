import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { musicApi } from '../lib/api'

export default function Album() {
  const { id } = useParams<{ id: string }>()
  const { play, track: nowTrack, isPlaying } = usePlayerStore()
  const [album, setAlbum] = useState<any>(null)
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    musicApi.getAlbum(id)
      .then(res => {
        setAlbum(res.album)
        setTracks(res.album?.tracks || [])
        setLoading(false)
      })
      .catch(() => {
        // Fallback: load trending as demo
        musicApi.trending().then(res => {
          const t = res.tracks
          setAlbum({ title: 'Trending Tracks', artist: { name: 'Various Artists' }, releaseDate: new Date().toISOString(), coverArt: t[0]?.album?.coverArt })
          setTracks(t)
          setLoading(false)
        }).catch(() => setLoading(false))
      })
  }, [id])

  if (loading) return <div className="fade-in"><p className="text-secondary">Loading album...</p></div>

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 40, marginBottom: 40 }}>
        <img src={album?.coverArt || 'https://picsum.photos/seed/album1/400/400'} alt={album?.title} style={{ width: 220, height: 220, borderRadius: 'var(--radius-2xl)', objectFit: 'cover', boxShadow: 'var(--shadow-glow-primary)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>Album</span>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>{album?.title || 'Album'}</h1>
          <p style={{ color: 'var(--color-on-surface-variant)' }}>{album?.artist?.name || 'Unknown Artist'} · {tracks.length} songs</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="btn-play-large btn" onClick={() => tracks.length > 0 && play(tracks[0], tracks)}>▶</button>
            <button className="btn-glass btn" onClick={() => {
              if (tracks.length > 0) {
                const shuffled = [...tracks].sort(() => Math.random() - 0.5)
                play(shuffled[0], shuffled)
              }
            }}>⇄ Shuffle</button>
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
          <img src={t.album?.coverArt || album?.coverArt || 'https://picsum.photos/200'} alt={t.title} className="track-thumb" />
          <div className="track-info">
            <div className="track-title">{t.title}</div>
            <div className="track-artist">{t.artist?.name || album?.artist?.name}</div>
          </div>
          {t.isExplicit && <span className="badge badge-explicit">E</span>}
          <span className="track-duration">{`${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}`}</span>
        </div>
      ))}
    </div>
  )
}
