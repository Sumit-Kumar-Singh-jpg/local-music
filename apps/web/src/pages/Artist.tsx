import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { musicApi } from '../lib/api'

export default function Artist() {
  const { id } = useParams<{ id: string }>()
  const { play, track: nowTrack, isPlaying } = usePlayerStore()
  const [artist, setArtist] = useState<any>(null)
  const [topTracks, setTopTracks] = useState<any[]>([])
  const [albums, setAlbums] = useState<any[]>([])
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    musicApi.getArtist(id)
      .then(res => {
        setArtist(res.artist)
        setTopTracks(res.artist?.tracks || [])
        setAlbums(res.artist?.albums || [])
        setLoading(false)
      })
      .catch(() => {
        // Fallback: use trending data
        musicApi.trending().then(res => {
          const t = res.tracks
          if (t.length > 0) {
            setArtist({ name: t[0].artist?.name || 'Artist', monthlyListeners: t.length * 1000, coverImage: t[0].album?.coverArt })
            setTopTracks(t)
          }
          setLoading(false)
        }).catch(() => setLoading(false))
      })
  }, [id])

  if (loading) return <div className="fade-in"><p className="text-secondary">Loading artist...</p></div>

  return (
    <div className="fade-in">
      <div style={{
        position: 'relative', height: 300, borderRadius: 'var(--radius-2xl)', overflow: 'hidden',
        backgroundImage: `url(${artist?.coverImage || artist?.image || 'https://picsum.photos/seed/artist1/1200/400'})`, backgroundSize: 'cover', backgroundPosition: 'center top',
        marginBottom: 32,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 24, left: 24 }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>{artist?.name || 'Artist'}</h1>
          <p style={{ color: 'var(--color-on-surface-variant)' }}>
            {artist?.monthlyListeners ? `${(artist.monthlyListeners / 1000).toFixed(1)}K monthly listeners` : ''}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        <button className="btn-primary btn" onClick={() => topTracks.length > 0 && play(topTracks[0], topTracks)}>▶ Play</button>
        <button
          className={`btn-glass btn${following ? ' active-ctrl' : ''}`}
          onClick={() => setFollowing(prev => !prev)}
        >
          {following ? '✓ Following' : 'Follow'}
        </button>
      </div>

      {topTracks.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>Popular Tracks</h2>
          {topTracks.slice(0, 5).map((t, i) => (
            <div key={t.id} className={`track-row${nowTrack?.id === t.id ? ' playing' : ''}`} onClick={() => play(t, topTracks)}>
              <span className="track-num">
                {nowTrack?.id === t.id && isPlaying
                  ? <div className="playing-bars"><span/><span/><span/></div>
                  : i+1}
              </span>
              <img src={t.album?.coverArt || t.cover || 'https://picsum.photos/200'} alt={t.title} className="track-thumb" />
              <div className="track-info">
                <div className="track-title">{t.title}</div>
                <div className="track-artist">{t.artist?.name || artist?.name}</div>
              </div>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>{t.playCount ? `${t.playCount} plays` : ''}</span>
              <span className="track-duration">{`${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}`}</span>
            </div>
          ))}
        </section>
      )}

      {albums.length > 0 && (
        <section>
          <h2 className="section-title" style={{ marginBottom: 16 }}>Discography</h2>
          <div className="scroll-row">
            {albums.map(album => (
              <div key={album.id} className="home-track-card glass">
                <div className="home-track-cover-wrap">
                  <img src={album.coverArt || 'https://picsum.photos/seed/disc/200/200'} alt={album.title} className="home-track-cover" />
                </div>
                <div className="home-track-title truncate">{album.title}</div>
                <div className="home-track-artist">Album · {new Date(album.releaseDate).getFullYear()}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
