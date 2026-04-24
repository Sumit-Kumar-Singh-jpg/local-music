import { usePlayerStore, formatTime, getArtistName, getCoverUrl } from '../store/playerStore'
import { useNavigate } from 'react-router-dom'
import './NowPlaying.css'

export default function NowPlaying() {
  const { 
    track, originalQueue, playQueue, isPlaying, progress, volume, shuffle, repeat, 
    togglePlay, next, prev, seek, setVolume, toggleShuffle, toggleRepeat 
  } = usePlayerStore()
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

  const duration = track.duration || 1; // Prevent division by zero
  const elapsed = Math.floor(progress * duration)
  // Show next tracks from playQueue
  const currentIndex = playQueue.findIndex(t => t.id === track.id)
  const upNext = playQueue.slice(currentIndex + 1, currentIndex + 6)
  
  const coverImg = getCoverUrl(track)
  const artistStr = getArtistName(track)
  const albumStr = track.albumTitle || 'Single'


  return (
    <div className="np-page fade-in" style={{ backgroundImage: `url(${coverImg})` }}>
      <div className="np-bg-overlay" />

      <div className="np-topbar">
        <button className="btn-icon" onClick={() => navigate(-1)} style={{ fontSize: '1.5rem' }}>‹</button>
        <span style={{ fontWeight: 800, letterSpacing: '0.2em', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Now Playing</span>
        <button className="btn-icon" onClick={() => navigate('/search')}>🔍</button>
      </div>

      <div className="np-content">
        {/* Left: Queue */}
        <div className="np-panel glass-low fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Queue</h3>
            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{upNext.length} tracks left</span>
          </div>
          {upNext.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upNext.map(qt => (
                <div key={qt.id} className="np-queue-item"
                  onClick={() => usePlayerStore.getState().play(qt, originalQueue)}>
                  <img src={getCoverUrl(qt)} alt={qt.title} className="np-queue-cover" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{qt.title}</div>
                    <div className="text-secondary truncate" style={{ fontSize: '0.7rem' }}>{getArtistName(qt)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary" style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: 40, opacity: 0.5 }}>End of the line.</p>
          )}
        </div>

        {/* Center: Player (The Dedicated Cover Page) */}
        <div className="np-center fade-in">
          <div className="np-art-container">
            <div 
              className="np-art-wrapper"
              style={{
                width: 'min(400px, 70vw)',
                aspectRatio: '1/1',
                borderRadius: 'min(40px, 10%)',
                overflow: 'hidden',
                boxShadow: '0 30px 90px rgba(0,0,0,0.8), 0 0 100px rgba(124, 77, 255, 0.2)',
                position: 'relative'
              }}
            >
              <img 
                src={coverImg} 
                alt={track.title} 
                className="np-album-art" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('solaris-placeholder');
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)',
                }}
              />
            </div>
          </div>
          
            <div style={{ textAlign: 'center', marginTop: 20, width: '100%', maxWidth: '800px' }}>
              <h2 style={{ 
                fontSize: 'min(3.5rem, 10vw)', 
                fontWeight: 900, 
                letterSpacing: '-0.05em',
                lineHeight: 1.1,
                marginBottom: 12,
                background: 'linear-gradient(to bottom, #fff, #bbb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{track.title}</h2>
              <p style={{ 
                fontSize: '1.25rem', 
                fontWeight: 500, 
                color: 'var(--color-primary)',
                letterSpacing: '0.04em',
                opacity: 0.8
              }}>{artistStr}</p>
            </div>

          <div className="np-seek" style={{ width: '100%', maxWidth: 480, marginTop: 20 }}>
            <span className="now-playing-time" style={{ width: 45 }}>{formatTime(elapsed)}</span>
            <div className="seek-bar" style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)' }}
              onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left)/r.width) }}>
              <div className="seek-progress" style={{ width: `${progress * 100}%`, background: 'var(--grad-primary)' }}>
                <div className="seek-thumb" style={{ width: 12, height: 12, top: -3 }} />
              </div>
            </div>
            <span className="now-playing-time" style={{ width: 45, textAlign: 'right' }}>{formatTime(track.duration)}</span>
          </div>

          <div className="np-controls" style={{ marginTop: 24, gap: 32 }}>
            <button className={`btn-icon${shuffle ? ' active-ctrl' : ''}`} onClick={toggleShuffle} style={{ fontSize: '1.2rem' }}>⇄</button>
            <button className="btn-icon" style={{ fontSize: '2rem' }} onClick={prev}>⏮</button>
            <button className="btn-play-large btn" 
              style={{ 
                width: 84, height: 84, fontSize: '2rem', 
                background: '#fff', color: '#000',
                boxShadow: '0 0 30px rgba(255,255,255,0.3)'
              }} 
              onClick={togglePlay}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="btn-icon" style={{ fontSize: '2rem' }} onClick={next}>⏭</button>
            <button className={`btn-icon${repeat !== 'off' ? ' active-ctrl' : ''}`} onClick={toggleRepeat} style={{ fontSize: '1.2rem' }}>
              {repeat === 'one' ? '🔂' : '⇆'}
            </button>
          </div>

          <div className="np-seek" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
             <span className="btn-icon" style={{ fontSize: '0.9rem' }}>🔊</span>
             <div className="seek-bar" style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)' }}
               onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setVolume((e.clientX - r.left)/r.width) }}>
               <div className="seek-progress" style={{ width: `${volume * 100}%` }}><div className="seek-thumb" style={{ width: 10, height: 10, top: -3 }} /></div>
             </div>
             <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', width: 40 }}>{Math.round(volume * 100)}%</span>
           </div>
        </div>

        {/* Right: Info panel */}
        <div className="np-panel glass-low fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Metadata</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="metadata-item">
              <div className="text-secondary" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Album</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{albumStr || 'Single'}</div>
            </div>
            <div className="metadata-item">
              <div className="text-secondary" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>High Fidelity</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>FLAC 24-bit</span>
                <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}>Hi-Res</span>
              </div>
            </div>
            <div className="metadata-item" style={{ marginTop: 20 }}>
              <button className="btn-glass btn" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => navigate('/library')}>Add to Library</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
