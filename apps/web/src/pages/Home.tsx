import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
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
      {/* Hero */}
      {featured ? (
        <div
          className="home-hero glass"
          style={{ backgroundImage: `url(${featured.album?.coverArt || featured.cover || 'https://picsum.photos/seed/hero1/900/400'})` }}
        >
          <div className="home-hero-overlay" />
          <div className="home-hero-content">
            <span className="home-hero-label">Featured Track</span>
            <h1 className="home-hero-title">{featured.title}</h1>
            <p className="home-hero-artist">{featured.artist?.name || featured.artist}</p>
            <div className="home-hero-actions">
              <button className="btn-play-large btn" onClick={() => play(featured, trending)}>▶</button>
              <button className={`btn-glass btn${likedSet.has(featured.id) ? ' active-ctrl' : ''}`}
                onClick={(e) => toggleLike(featured.id, e)}>
                {likedSet.has(featured.id) ? '♥' : '♡'} Like
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="home-hero glass">
          <div className="home-hero-overlay" />
          <div className="home-hero-content">
            <span className="home-hero-label">Welcome</span>
            <h1 className="home-hero-title">Start Listening</h1>
            <p className="home-hero-artist">Search for tracks or browse trending music below</p>
          </div>
        </div>
      )}

      {/* Recently Played / Trending Quick Access */}
      {RECENT.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-title">Recently Played</h2>
            <button className="section-link" onClick={() => navigate('/library')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
          </div>
          <div className="scroll-row">
            {RECENT.map(t => (
              <div
                key={t.id}
                className={`home-track-card glass${nowTrack?.id === t.id ? ' now-card' : ''}`}
                onClick={() => play(t, trending)}
              >
                <div className="home-track-cover-wrap">
                  <img src={t.album?.coverArt || t.cover || 'https://picsum.photos/200'} alt={t.title} className="home-track-cover" />
                  <div className="home-track-play-overlay">
                    {nowTrack?.id === t.id && isPlaying
                      ? <div className="playing-bars"><span/><span/><span/></div>
                      : <span className="home-track-play-icon">▶</span>
                    }
                  </div>
                </div>
                <div className="home-track-title truncate">{t.title}</div>
                <div className="home-track-artist truncate">{t.artist?.name || t.artist}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Discover Weekly Hero */}
      {trending.length > 0 && (
        <section className="home-discover-section">
          <div className="home-discover-card glass-heavy">
            <div className="home-discover-left">
              <span className="home-discover-eyebrow">🎵 Discover Weekly</span>
              <h2>Your personal<br /><span className="gradient-text">mixtape</span></h2>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>{trending.length} songs curated just for you</p>
              <button className="btn-primary btn" style={{ marginTop: 16 }}
                onClick={() => play(trending[0], trending)}>
                ▶ Play Now
              </button>
            </div>
            <div className="home-discover-covers">
              {trending.slice(0, 4).map(t => (
                <img key={t.id} src={t.album?.coverArt || t.cover || 'https://picsum.photos/200'} alt={t.title} className="home-discover-cover" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse Genres — navigates to search */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Browse Genres</h2>
        </div>
        <div className="home-categories">
          {[
            { name: 'Pop', color: '#A855F7' }, { name: 'Hip-Hop', color: '#EC4899' },
            { name: 'Electronic', color: '#3B82F6' }, { name: 'R&B', color: '#10B981' },
            { name: 'Rock', color: '#F59E0B' }, { name: 'Jazz', color: '#EF4444' },
          ].map(c => (
            <div
              key={c.name}
              className="home-category-card"
              style={{ background: `linear-gradient(135deg, ${c.color}88, ${c.color}44)`, cursor: 'pointer' }}
              onClick={() => navigate(`/search?q=${c.name}`)}
            >
              <span className="home-category-name">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      {trending.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-title">Trending Now 🔥</h2>
          </div>
          <div>
            {trending.map((t, i) => (
              <div
                key={t.id}
                className={`track-row${nowTrack?.id === t.id ? ' playing' : ''}`}
                onClick={() => play(t, trending)}
              >
                <span className="track-num">
                  {nowTrack?.id === t.id && isPlaying
                    ? <div className="playing-bars"><span/><span/><span/></div>
                    : i + 1}
                </span>
                <img src={t.album?.coverArt || t.cover || 'https://picsum.photos/200'} alt={t.title} className="track-thumb" />
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
