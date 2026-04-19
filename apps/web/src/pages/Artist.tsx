import { DEMO_TRACKS } from '../store/playerStore'
import { usePlayerStore } from '../store/playerStore'

export default function Artist() {
  const { play, track: nowTrack, isPlaying } = usePlayerStore()
  const artist = { name: 'The Weeknd', followers: '42.1M', cover: 'https://picsum.photos/seed/artist1/1200/400', avatar: 'https://picsum.photos/seed/artist1a/400/400' }
  const topTracks = DEMO_TRACKS.slice(0, 5)

  return (
    <div className="fade-in">
      <div style={{
        position: 'relative', height: 300, borderRadius: 'var(--radius-2xl)', overflow: 'hidden',
        backgroundImage: `url(${artist.cover})`, backgroundSize: 'cover', backgroundPosition: 'center top',
        marginBottom: 32,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 24, left: 24 }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>{artist.name}</h1>
          <p style={{ color: 'var(--color-on-surface-variant)' }}>{artist.followers} followers</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        <button className="btn-primary btn" onClick={() => play(topTracks[0], topTracks)}>▶ Play</button>
        <button className="btn-glass btn">Follow</button>
        <button className="btn-glass btn">⋯</button>
      </div>

      <section style={{ marginBottom: 40 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>Popular Tracks</h2>
        {topTracks.map((t, i) => (
          <div key={t.id} className={`track-row${nowTrack?.id === t.id ? ' playing' : ''}`} onClick={() => play(t, topTracks)}>
            <span className="track-num">
              {nowTrack?.id === t.id && isPlaying
                ? <div className="playing-bars"><span/><span/><span/></div>
                : i+1}
            </span>
            <img src={t.cover} alt={t.title} className="track-thumb" />
            <div className="track-info">
              <div className="track-title">{t.title}</div>
              <div className="track-artist">{t.artist}</div>
            </div>
            <span className="text-secondary" style={{ fontSize: '0.8rem' }}>324M</span>
            <span className="track-duration">{`${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}`}</span>
          </div>
        ))}
      </section>

      <section>
        <h2 className="section-title" style={{ marginBottom: 16 }}>Discography</h2>
        <div className="scroll-row">
          {['After Hours', 'Dawn FM', 'Starboy', 'Beauty Behind the Madness'].map((album, i) => (
            <div key={album} className="home-track-card glass">
              <div className="home-track-cover-wrap">
                <img src={`https://picsum.photos/seed/disc${i}/200/200`} alt={album} className="home-track-cover" />
              </div>
              <div className="home-track-title truncate">{album}</div>
              <div className="home-track-artist">Album · {2021 - i}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
