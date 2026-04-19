import { usePlayerStore, formatTime } from '../store/playerStore'
import { useNavigate } from 'react-router-dom'
import './NowPlaying.css'

export default function NowPlaying() {
  const { track, queue, isPlaying, progress, volume, shuffle, repeat, togglePlay, next, prev, seek, setVolume, toggleShuffle, toggleRepeat } = usePlayerStore()
  const navigate = useNavigate()

  if (!track) {
    return (
      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', marginBottom: 16 }}>🎵</p>
          <h2>Nothing playing</h2>
          <p className="text-secondary">Pick a track to get started</p>
          <button className="btn-primary btn" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Browse Music</button>
        </div>
      </div>
    )
  }

  const elapsed = Math.floor(progress * track.duration)
  const upNext = queue.filter(t => t.id !== track.id).slice(0, 5)

  return (
    <div className="np-page fade-in" style={{ backgroundImage: `url(${track.cover || track.album?.coverArt || ''})` }}>
      <div className="np-bg-overlay" />

      <div className="np-topbar">
        <button className="btn-icon" onClick={() => navigate(-1)}>‹</button>
        <span style={{ fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Now Playing</span>
        <span />
      </div>

      <div className="np-content">
        {/* Left: Queue */}
        <div className="np-panel glass">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Up Next</h3>
          {upNext.length > 0 ? (
            upNext.map(qt => (
              <div key={qt.id} className={`np-queue-item${qt.id === track.id ? ' active' : ''}`}
                onClick={() => usePlayerStore.getState().play(qt, queue)}>
                <img src={qt.cover || qt.album?.coverArt || 'https://picsum.photos/200'} alt={qt.title} className="np-queue-cover" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="truncate" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{qt.title}</div>
                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{qt.artist?.name || qt.artist}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-secondary" style={{ fontSize: '0.85rem' }}>No more tracks in queue</p>
          )}
        </div>

        {/* Center: Player */}
        <div className="np-center">
          <img src={track.cover || track.album?.coverArt || 'https://picsum.photos/400'} alt={track.title} className="np-album-art" />
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em' }}>{track.title}</h2>
            <p style={{ color: 'var(--color-on-surface-variant)' }}>{track.artist?.name || track.artist}</p>
          </div>

          <div className="np-seek">
            <span className="now-playing-time">{formatTime(elapsed)}</span>
            <div className="seek-bar" style={{ flex: 1 }}
              onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left)/r.width) }}>
              <div className="seek-progress" style={{ width: `${progress * 100}%` }}><div className="seek-thumb" /></div>
            </div>
            <span className="now-playing-time">{formatTime(track.duration)}</span>
          </div>

          <div className="np-controls">
            <button className={`btn-icon${shuffle ? ' active-ctrl' : ''}`} onClick={toggleShuffle}>⇄</button>
            <button className="btn-icon" style={{ fontSize: '1.5rem' }} onClick={prev}>⏮</button>
            <button className="btn-play-large btn" style={{ width: 70, height: 70, fontSize: '1.5rem' }} onClick={togglePlay}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="btn-icon" style={{ fontSize: '1.5rem' }} onClick={next}>⏭</button>
            <button className={`btn-icon${repeat !== 'off' ? ' active-ctrl' : ''}`} onClick={toggleRepeat}>
              {repeat === 'one' ? '🔂' : '⇆'}
            </button>
          </div>

          <div className="np-seek" style={{ marginTop: 8 }}>
            <span className="btn-icon" style={{ fontSize: '0.9rem' }}>🔊</span>
            <div className="seek-bar" style={{ flex: 1 }}
              onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setVolume((e.clientX - r.left)/r.width) }}>
              <div className="seek-progress" style={{ width: `${volume * 100}%` }}><div className="seek-thumb" /></div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Right: Info panel */}
        <div className="np-panel glass">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Track Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Album</div>
              <div style={{ fontSize: '0.9rem' }}>{track.album?.title || track.album || 'Single'}</div>
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Duration</div>
              <div style={{ fontSize: '0.9rem' }}>{formatTime(track.duration)}</div>
            </div>
            {track.explicit && (
              <div>
                <span className="badge badge-explicit">Explicit</span>
              </div>
            )}
            {track.hifi && (
              <div>
                <span className="badge badge-hifi">HiFi</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
