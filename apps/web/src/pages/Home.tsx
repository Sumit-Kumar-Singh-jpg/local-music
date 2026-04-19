import { usePlayerStore, DEMO_TRACKS } from '../store/playerStore'
import './Home.css'

const FEATURED = {
  title: 'Midnight City',
  artist: 'M83',
  desc: 'An anthemic synth-pop journey through glowing cityscapes.',
  cover: 'https://picsum.photos/seed/hero1/900/400',
}

const CATEGORIES = [
  { name: 'HiFi Audio',     color: '#A855F7', cover: 'https://picsum.photos/seed/c1/200/200' },
  { name: 'Late Night',     color: '#EC4899', cover: 'https://picsum.photos/seed/c2/200/200' },
  { name: 'Discover',       color: '#3B82F6', cover: 'https://picsum.photos/seed/c3/200/200' },
  { name: 'Chill Vibes',    color: '#10B981', cover: 'https://picsum.photos/seed/c4/200/200' },
  { name: 'Workout',        color: '#F59E0B', cover: 'https://picsum.photos/seed/c5/200/200' },
  { name: 'Focus',          color: '#EF4444', cover: 'https://picsum.photos/seed/c6/200/200' },
]

const RECENT = DEMO_TRACKS.slice(0, 6)
const TRENDING = DEMO_TRACKS.slice(2)

export default function Home() {
  const { play, track: nowTrack, isPlaying, togglePlay } = usePlayerStore()

  return (
    <div className="home-page fade-in">
      {/* Hero */}
      <div
        className="home-hero glass"
        style={{ backgroundImage: `url(${FEATURED.cover})` }}
      >
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <span className="home-hero-label">Featured Mix</span>
          <h1 className="home-hero-title">{FEATURED.title}</h1>
          <p className="home-hero-artist">{FEATURED.artist}</p>
          <p className="home-hero-desc">{FEATURED.desc}</p>
          <div className="home-hero-actions">
            <button
              className="btn-play-large btn"
              onClick={() => play(DEMO_TRACKS[0], DEMO_TRACKS)}
            >▶</button>
            <button className="btn-glass btn">♡ Like</button>
            <button className="btn-glass btn">⊞ Add to library</button>
          </div>
        </div>
      </div>

      {/* Recently Played */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Recently Played</h2>
          <a href="#" className="section-link">See all</a>
        </div>
        <div className="scroll-row">
          {RECENT.map(t => (
            <div
              key={t.id}
              className={`home-track-card glass${nowTrack?.id === t.id ? ' now-card' : ''}`}
              onClick={() => play(t, DEMO_TRACKS)}
            >
              <div className="home-track-cover-wrap">
                <img src={t.cover} alt={t.title} className="home-track-cover" />
                <div className="home-track-play-overlay">
                  {nowTrack?.id === t.id && isPlaying
                    ? <div className="playing-bars"><span/><span/><span/></div>
                    : <span className="home-track-play-icon">▶</span>
                  }
                </div>
              </div>
              <div className="home-track-title truncate">{t.title}</div>
              <div className="home-track-artist truncate">{t.artist}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Discover Weekly Hero */}
      <section className="home-discover-section">
        <div className="home-discover-card glass-heavy">
          <div className="home-discover-left">
            <span className="home-discover-eyebrow">🎵 Discover Weekly</span>
            <h2>Your personal<br /><span className="gradient-text">mixtape</span></h2>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>30 songs curated just for you · Updated every Monday</p>
            <button className="btn-primary btn" style={{ marginTop: 16 }}
              onClick={() => play(DEMO_TRACKS[3], DEMO_TRACKS)}>
              ▶ Play Now
            </button>
          </div>
          <div className="home-discover-covers">
            {DEMO_TRACKS.slice(0, 4).map(t => (
              <img key={t.id} src={t.cover} alt={t.title} className="home-discover-cover" />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Browse Genres</h2>
        </div>
        <div className="home-categories">
          {CATEGORIES.map(c => (
            <div
              key={c.name}
              className="home-category-card"
              style={{
                background: `linear-gradient(135deg, ${c.color}88, ${c.color}44)`,
                backgroundImage: `linear-gradient(135deg, ${c.color}aa 0%, ${c.color}33 100%), url(${c.cover})`,
                backgroundSize: 'cover',
                backgroundBlendMode: 'overlay',
              }}
            >
              <span className="home-category-name">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Trending Now 🔥</h2>
          <a href="#" className="section-link">See all</a>
        </div>
        <div>
          {TRENDING.map((t, i) => (
            <div
              key={t.id}
              className={`track-row${nowTrack?.id === t.id ? ' playing' : ''}`}
              onClick={() => play(t, TRENDING)}
            >
              <span className="track-num">
                {nowTrack?.id === t.id && isPlaying
                  ? <div className="playing-bars"><span/><span/><span/></div>
                  : i + 1}
              </span>
              <img src={t.cover} alt={t.title} className="track-thumb" />
              <div className="track-info">
                <div className="track-title">{t.title}</div>
                <div className="track-artist">{t.artist}</div>
              </div>
              <span className="text-secondary" style={{ fontSize: '0.8125rem' }}>{t.album}</span>
              <span className="track-duration">
                {`${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}`}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
