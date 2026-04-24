import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore, getCoverUrl } from '../store/playerStore'
import { musicApi } from '../lib/api'
import './Home.css'

export default function Home() {
  const { play, track: nowTrack, isPlaying } = usePlayerStore()
  const navigate = useNavigate()
  const [trending, setTrending] = useState<any[]>([])
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    musicApi.trending().then(res => setTrending(res.tracks)).catch(console.error)
  }, [])

  const handleTrackClick = (t: any, queue: any[]) => {
    play(t, queue)
    navigate('/now-playing')
  }


  const toggleLike = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLikedSet(prev => {
      const next = new Set(prev)
      if (next.has(trackId)) next.delete(trackId)
      else next.add(trackId)
      return next
    })
  }

  const RECENT = trending.slice(0, 6)
  const featured = trending[0]

  return (
    <div className="home-page fade-in">
      {/* Solaris Solaris Hero */}
      <div className="home-hero glass-heavy" style={{ backgroundImage: `url(${featured?.album?.coverArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=2070'})` }}>
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <span className="home-hero-label">The Solaris Mission</span>
          <h1 className="home-hero-title">Free Music for<br />Everyone.</h1>
          <p className="home-hero-desc">
            Experience the full power of high-fidelity music streaming without boundaries. 
            No ads, no subscriptions, just pure sound.
          </p>
          <div className="home-hero-actions">
            <button className="btn-primary btn" onClick={() => featured && handleTrackClick(featured, trending)}>
              Start Listening
            </button>
            <button className="btn-glass btn" onClick={() => navigate('/search')}>
              Explore Catalogue
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="features-section">
        <div className="feature-card glass">
          <span className="feature-icon">🛡️</span>
          <h3>Zero Ads</h3>
          <p>Interrupt-free listening. We never break your flow with audio ads or intrusive banners.</p>
        </div>
        <div className="feature-card glass">
          <span className="feature-icon">⏩</span>
          <h3>Unlimited Skips</h3>
          <p>Take full control of your queue. Skip as much as you want, whenever you want.</p>
        </div>
        <div className="feature-card glass">
          <span className="feature-icon">🎧</span>
          <h3>Lossless Hi-Fi</h3>
          <p>Native FLAC support at 320kbps and above. Hear music as the artist intended.</p>
        </div>
        <div className="feature-card glass">
          <span className="feature-icon">💾</span>
          <h3>Offline Mode</h3>
          <p>Download everything. Take your library anywhere, even without connectivity.</p>
        </div>
      </section>

      {/* Trending Quick Access */}
      {RECENT.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-title">Jump Back In</h2>
            <button className="section-link" onClick={() => navigate('/library')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>View Library</button>
          </div>
          <div className="scroll-row">
            {RECENT.map(t => (
              <div
                key={t.id}
                className={`home-track-card glass${nowTrack?.id === t.id ? ' now-card' : ''}`}
                onClick={() => handleTrackClick(t, trending)}
              >
                <div className="home-track-cover-wrap">
                  {getCoverUrl(t) ? (
                    <img src={getCoverUrl(t)} alt={t.title} className="home-track-cover" onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('solaris-placeholder');
                    }} />
                  ) : <div className="solaris-placeholder" style={{ width: '100%', height: '100%' }} />}
                </div>
                <div className="home-track-title truncate">{t.title}</div>
                <div className="home-track-artist truncate">{t.artist?.name || t.artist}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Discover Weekly Mixtape */}
      {trending.length > 0 && (
        <section className="home-discover-section">
          <div className="home-discover-card glass-heavy">
            <div className="home-discover-left">
              <span className="home-discover-eyebrow">✨ Curated for You</span>
              <h2>Your Solar<br /><span className="gradient-text">Mixtape</span></h2>
              <p className="text-secondary" style={{ fontSize: '0.9rem', maxWidth: 300, marginTop: 8 }}>
                A custom-engineered selection of tracks based on your unique listening DNA.
              </p>
              <button className="btn-primary btn" style={{ marginTop: 24 }}
                onClick={() => handleTrackClick(trending[0], trending)}>
                ▶ Play Mix
              </button>
            </div>
            <div className="home-discover-covers">
              {trending.slice(0, 4).map(t => (
                <div key={t.id} className="home-discover-cover-wrap" style={{ width: 100, height: 100, borderRadius: 'var(--radius-md', overflow: 'hidden' }}>
                   {getCoverUrl(t) ? (
                    <img src={getCoverUrl(t)} alt={t.title} className="home-discover-cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('solaris-placeholder');
                    }} />
                  ) : <div className="solaris-placeholder" style={{ width: '100%', height: '100%' }} />}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Now */}
      {trending.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-title">Global Trending 🔥</h2>
          </div>
          <div>
            {trending.map((t, i) => (
              <div
                key={t.id}
                className={`track-row${nowTrack?.id === t.id ? ' playing' : ''}`}
                onClick={() => handleTrackClick(t, trending)}
              >
                <span className="track-num">
                  {nowTrack?.id === t.id && isPlaying
                    ? <div className="playing-bars"><span/><span/><span/></div>
                    : i + 1}
                </span>
                <div className="track-thumb-wrap" style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  {getCoverUrl(t) ? (
                    <img src={getCoverUrl(t)} alt={t.title} className="track-thumb" style={{ width: '100%', height: '100%' }} onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('solaris-placeholder');
                    }} />
                  ) : <div className="solaris-placeholder" style={{ width: '100%', height: '100%' }} />}
                </div>
                <div className="track-info">
                  <div className="track-title">{t.title}</div>
                  <div className="track-artist">{t.artist?.name || t.artist}</div>
                </div>
                <span className="text-secondary" style={{ fontSize: '0.8125rem' }}>{t.album?.title || t.album}</span>
                <button
                  className={`btn-icon${likedSet.has(t.id) ? ' active-ctrl' : ''}`}
                  onClick={(e) => toggleLike(t.id, e)}
                  style={{ fontSize: '0.9rem' }}
                >{likedSet.has(t.id) ? '♥' : '♡'}</button>
                <span className="track-duration">
                  {`${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
