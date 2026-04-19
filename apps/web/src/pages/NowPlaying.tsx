import { usePlayerStore, formatTime, DEMO_TRACKS } from '../store/playerStore'
import { useNavigate } from 'react-router-dom'
import './NowPlaying.css'

const LYRICS = [
  { id: 1, text: "I know that you're scared because hearts get broken", active: false },
  { id: 2, text: "I don't want to cry anymore, losing you", active: false },
  { id: 3, text: "Save your tears for another day", active: true },
  { id: 4, text: "I realized you were crying, crying for me", active: false },
  { id: 5, text: "And it's breaking my heart to say", active: false },
]

export default function NowPlaying() {
  const { track, isPlaying, progress, volume, shuffle, repeat, togglePlay, next, prev, seek, setVolume, toggleShuffle, toggleRepeat } = usePlayerStore()
  const navigate = useNavigate()

  const t = track ?? DEMO_TRACKS[0]
  const elapsed = Math.floor(progress * t.duration)

  return (
    <div className="np-page fade-in" style={{ backgroundImage: `url(${t.cover})` }}>
      <div className="np-bg-overlay" />

      <div className="np-topbar">
        <button className="btn-icon" onClick={() => navigate(-1)}>‹</button>
        <span style={{ fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Now Playing</span>
        <button className="btn-icon">⋯</button>
      </div>

      <div className="np-content">
        {/* Left: Queue */}
        <div className="np-panel glass">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Up Next</h3>
          {DEMO_TRACKS.slice(0, 5).map(qt => (
            <div key={qt.id} className={`np-queue-item${qt.id === t.id ? ' active' : ''}`}>
              <img src={qt.cover} alt={qt.title} className="np-queue-cover" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="truncate" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{qt.title}</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{qt.artist}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Center: Player */}
        <div className="np-center">
          <img src={t.cover} alt={t.title} className="np-album-art" />
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em' }}>{t.title}</h2>
            <p style={{ color: 'var(--color-on-surface-variant)' }}>{t.artist}</p>
          </div>

          <div className="np-seek">
            <span className="now-playing-time">{formatTime(elapsed)}</span>
            <div className="seek-bar" style={{ flex: 1 }}
              onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left)/r.width) }}>
              <div className="seek-progress" style={{ width: `${progress * 100}%` }}><div className="seek-thumb" /></div>
            </div>
            <span className="now-playing-time">{formatTime(t.duration)}</span>
          </div>

          <div className="np-controls">
            <button className={`btn-icon${shuffle ? ' active-ctrl' : ''}`} onClick={toggleShuffle}>⇄</button>
            <button className="btn-icon" style={{ fontSize: '1.5rem' }} onClick={prev}>⏮</button>
            <button className="btn-play-large btn" style={{ width: 70, height: 70, fontSize: '1.5rem' }} onClick={togglePlay}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="btn-icon" style={{ fontSize: '1.5rem' }} onClick={next}>⏭</button>
            <button className={`btn-icon${repeat !== 'off' ? ' active-ctrl' : ''}`} onClick={toggleRepeat}>⇆</button>
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

        {/* Right: Lyrics */}
        <div className="np-panel glass">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Lyrics</h3>
          <div className="np-lyrics">
            {LYRICS.map(l => (
              <p key={l.id} className={`np-lyric-line${l.active ? ' active' : ''}`}>{l.text}</p>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: 20 }}>Lyrics by Genius</p>
        </div>
      </div>
    </div>
  )
}
