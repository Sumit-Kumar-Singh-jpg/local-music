import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { musicApi, playlistApi } from '../lib/api'
import { useModalStore } from '../store/modalStore'

const FILTERS = ['All', 'Playlists', 'Albums', 'Artists']

export default function Library() {
  const [filter, setFilter] = useState('All')
  const [playlists, setPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      playlistApi.list().catch(() => ({ playlists: [] })),
      musicApi.trending().catch(() => ({ tracks: [] })),
    ]).then(([plRes]) => {
      setPlaylists(plRes.playlists)
      setLoading(false)
    })
  }, [])

  const { showPrompt, showAlert } = useModalStore()
  const handleCreate = () => {
    showPrompt('New Playlist', 'Enter a name for your new playlist:', (name) => {
      if (name) {
        playlistApi.create(name).then(res => {
          setPlaylists(prev => [res.playlist, ...prev])
        }).catch(err => showAlert('Error', err.message))
      }
    })
  }


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
          {playlists.length > 0 ? (
            <div className="cards-grid">
              {playlists.map(pl => (
                <div key={pl.id} className="home-track-card glass" style={{ padding: 16 }} onClick={() => navigate(`/playlist/${pl.id}`)}>
                  <div className="home-track-cover-wrap" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '1/1', marginBottom: 12 }}>
                    <img src={pl.coverArt || 'https://picsum.photos/seed/' + pl.id + '/400/400'} alt={pl.name} className="home-track-cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="home-track-play-overlay">
                      <span className="home-track-play-icon" style={{ fontSize: '2rem' }}>▶</span>
                    </div>
                  </div>
                  <div className="home-track-title truncate" style={{ fontWeight: 600, fontSize: '1rem' }}>{pl.name}</div>
                  <div className="home-track-artist" style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: 4 }}>Playlist • {pl.trackCount || 0} songs</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 60px' }} className="glass-low">
              <p className="text-secondary" style={{ fontSize: '1.25rem', fontWeight: 500 }}>No Playlists Yet</p>
              <p className="text-secondary" style={{ marginTop: 12, opacity: 0.7 }}>Create your first playlist to start organizing your music.</p>
              <button className="btn-primary btn" style={{ marginTop: 32 }} onClick={handleCreate}>+ Create Playlist</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
