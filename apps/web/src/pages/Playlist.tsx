import { DEMO_TRACKS } from '../store/playerStore'
import { usePlayerStore } from '../store/playerStore'

export default function Playlist() {
  const { play, track: nowTrack, isPlaying } = usePlayerStore()
  const playlist = { name: 'Chill Vibes 🎶', desc: 'Your handpicked collection for late nights', cover: 'https://picsum.photos/seed/pl1/400/400' }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 40, marginBottom: 40 }}>
        <img src={playlist.cover} alt={playlist.name} style={{ width: 220, height: 220, borderRadius: 'var(--radius-2xl)', objectFit: 'cover', boxShadow: 'var(--shadow-glow-secondary)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>Playlist</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>{playlist.name}</h1>
          <p style={{ color: 'var(--color-on-surface-variant)' }}>{playlist.desc}</p>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Made by You · Public · 87 songs · 5 hr 43 min</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="btn-play-large btn" onClick={() => play(DEMO_TRACKS[0], DEMO_TRACKS)}>▶</button>
            <button className="btn-glass btn">⇄</button>
            <button className="btn-glass btn">♡</button>
            <button className="btn-glass btn">⋯</button>
          </div>
        </div>
      </div>

      {DEMO_TRACKS.map((t, i) => (
        <div key={t.id} className={`track-row${nowTrack?.id === t.id ? ' playing' : ''}`} onClick={() => play(t, DEMO_TRACKS)}>
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
          <span className="text-secondary" style={{ fontSize: '0.815rem' }}>{t.album}</span>
          <span className="track-duration">{`${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}`}</span>
        </div>
      ))}
    </div>
  )
}
