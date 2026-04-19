import { DEMO_TRACKS } from '../store/playerStore'
import { usePlayerStore } from '../store/playerStore'

export default function Album() {
  const { play, track: nowTrack, isPlaying } = usePlayerStore()
  const album = { title: 'After Hours', artist: 'The Weeknd', year: 2020, cover: 'https://picsum.photos/seed/album1/400/400' }
  const tracks = DEMO_TRACKS.slice(0, 6)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 40, marginBottom: 40 }}>
        <img src={album.cover} alt={album.title} style={{ width: 220, height: 220, borderRadius: 'var(--radius-2xl)', objectFit: 'cover', boxShadow: 'var(--shadow-glow-primary)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>Album</span>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>{album.title}</h1>
          <p style={{ color: 'var(--color-on-surface-variant)' }}>{album.artist} · {album.year} · {tracks.length} songs</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="btn-play-large btn" onClick={() => play(tracks[0], tracks)}>▶</button>
            <button className="btn-glass btn">⇄ Shuffle</button>
            <button className="btn-glass btn">♡</button>
          </div>
        </div>
      </div>

      {tracks.map((t, i) => (
        <div key={t.id} className={`track-row${nowTrack?.id === t.id ? ' playing' : ''}`} onClick={() => play(t, tracks)}>
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
          {t.explicit && <span className="badge badge-explicit">E</span>}
          <span className="track-duration">{`${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}`}</span>
        </div>
      ))}
    </div>
  )
}
