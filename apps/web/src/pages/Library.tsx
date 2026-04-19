import { useState } from 'react'
import { DEMO_TRACKS } from '../store/playerStore'
import { usePlayerStore } from '../store/playerStore'

const FILTERS = ['All', 'Playlists', 'Albums', 'Artists', 'Podcasts']

const PLAYLISTS = [
  { id: 'pl1', name: 'Chill Vibes 🎶',   tracks: 87, cover: 'https://picsum.photos/seed/pl1/200/200' },
  { id: 'pl2', name: 'Late Night Drive',  tracks: 43, cover: 'https://picsum.photos/seed/pl2/200/200' },
  { id: 'pl3', name: 'Workout Hits 🔥',   tracks: 62, cover: 'https://picsum.photos/seed/pl3/200/200' },
  { id: 'pl4', name: 'Study Focus',       tracks: 35, cover: 'https://picsum.photos/seed/pl4/200/200' },
  { id: 'pl5', name: 'Liked Songs ♡',     tracks: 214, cover: 'https://picsum.photos/seed/pl5/200/200' },
  { id: 'pl6', name: 'Throwbacks',        tracks: 91, cover: 'https://picsum.photos/seed/pl6/200/200' },
]

export default function Library() {
  const [filter, setFilter] = useState('All')
  const { play } = usePlayerStore()

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 className="section-title" style={{ fontSize: '1.75rem' }}>Your Library</h1>
        <button className="btn-primary btn" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>+ Create</button>
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

      <div className="cards-grid">
        {PLAYLISTS.map(pl => (
          <div key={pl.id} className="home-track-card glass" onClick={() => play(DEMO_TRACKS[0], DEMO_TRACKS)}>
            <div className="home-track-cover-wrap">
              <img src={pl.cover} alt={pl.name} className="home-track-cover" />
              <div className="home-track-play-overlay">
                <span className="home-track-play-icon">▶</span>
              </div>
            </div>
            <div className="home-track-title truncate">{pl.name}</div>
            <div className="home-track-artist">{pl.tracks} songs</div>
          </div>
        ))}
      </div>

      <section style={{ marginTop: 48 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>Recently Added</h2>
        {DEMO_TRACKS.slice(0, 5).map((t, i) => (
          <div key={t.id} className="track-row" onClick={() => play(t, DEMO_TRACKS)}>
            <span className="track-num">{i+1}</span>
            <img src={t.cover} alt={t.title} className="track-thumb" />
            <div className="track-info">
              <div className="track-title">{t.title}</div>
              <div className="track-artist">{t.artist}</div>
            </div>
            <span className="text-secondary" style={{ fontSize: '0.815rem' }}>{t.album}</span>
            <span className="track-duration">{`${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}`}</span>
          </div>
        ))}
      </section>
    </div>
  )
}
