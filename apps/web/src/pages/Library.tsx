import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { musicApi, playlistApi } from '../lib/api'

const FILTERS = ['All', 'Playlists', 'Albums', 'Artists']

export default function Library() {
  const [filter, setFilter] = useState('All')
  const { play } = usePlayerStore()
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState<any[]>([])
  const [recentTracks, setRecentTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      playlistApi.list().catch(() => ({ playlists: [] })),
      musicApi.trending().catch(() => ({ tracks: [] })),
    ]).then(([plRes, trRes]) => {
      setPlaylists(plRes.playlists)
      setRecentTracks(trRes.tracks)
      setLoading(false)
    })
  }, [])

  const handleCreate = () => {
    const name = prompt('Enter playlist name:')
    if (name) {
      playlistApi.create(name).then(res => {
        setPlaylists(prev => [res.playlist, ...prev])
      }).catch(console.error)
    }
  }

  const filteredPlaylists = playlists

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 className="section-title" style={{ fontSize: '1.75rem' }}>Your Library</h1>
        <button className="btn-primary btn" style={{ padding: '8px 20px', fontSize: '0.875rem' }} onClick={handleCreate}>+ Create</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={f === filter ? 'btn-primary btn' : 'btn-glass btn'}
            style={{ padding: '6px 16px', fontSize: '0.875rem', borderRadius: 'var(--radius-full)' }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-secondary">Loading your library...</p>
      ) : (
        <>
          {filteredPlaylists.length > 0 && (
            <div className="cards-grid">
              {filteredPlaylists.map(pl => (
                <div key={pl.id} className="home-track-card glass" onClick={() => navigate(`/playlist/${pl.id}`)}>
                  <div className="home-track-cover-wrap">
                    <img src={pl.coverArt || 'https://picsum.photos/seed/' + pl.id + '/200/200'} alt={pl.name} className="home-track-cover" />
                    <div className="home-track-play-overlay">
                      <span className="home-track-play-icon">▶</span>
                    </div>
                  </div>
                  <div className="home-track-title truncate">{pl.name}</div>
                  <div className="home-track-artist">{pl.trackCount || 0} songs</div>
                </div>
              ))}
            </div>
          )}

          {recentTracks.length > 0 && (
            <section style={{ marginTop: 48 }}>
              <h2 className="section-title" style={{ marginBottom: 16 }}>Recently Added</h2>
              {recentTracks.slice(0, 5).map((t, i) => (
                <div key={t.id} className="track-row" onClick={() => play(t, recentTracks)}>
                  <span className="track-num">{i+1}</span>
                  <img src={t.album?.coverArt || t.cover || 'https://picsum.photos/200'} alt={t.title} className="track-thumb" />
                  <div className="track-info">
                    <div className="track-title">{t.title}</div>
                    <div className="track-artist">{t.artist?.name || t.artist}</div>
                  </div>
                  <span className="text-secondary" style={{ fontSize: '0.815rem' }}>{t.album?.title || ''}</span>
                  <span className="track-duration">{`${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}`}</span>
                </div>
              ))}
            </section>
          )}

          {filteredPlaylists.length === 0 && recentTracks.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Your library is empty</p>
              <p className="text-secondary" style={{ marginTop: 8 }}>Start liking songs and creating playlists!</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
