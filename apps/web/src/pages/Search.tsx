import { useState } from 'react'
import { DEMO_TRACKS } from '../store/playerStore'
import { usePlayerStore } from '../store/playerStore'

const GENRES = [
  { name: 'Pop',       color: '#A855F7', cover: 'https://picsum.photos/seed/g1/200/200' },
  { name: 'Hip-Hop',   color: '#EC4899', cover: 'https://picsum.photos/seed/g2/200/200' },
  { name: 'Electronic',color: '#3B82F6', cover: 'https://picsum.photos/seed/g3/200/200' },
  { name: 'R&B',       color: '#10B981', cover: 'https://picsum.photos/seed/g4/200/200' },
  { name: 'Rock',      color: '#F59E0B', cover: 'https://picsum.photos/seed/g5/200/200' },
  { name: 'Jazz',      color: '#EF4444', cover: 'https://picsum.photos/seed/g6/200/200' },
  { name: 'Classical', color: '#6366F1', cover: 'https://picsum.photos/seed/g7/200/200' },
  { name: 'Country',   color: '#F97316', cover: 'https://picsum.photos/seed/g8/200/200' },
  { name: 'Latin',     color: '#84CC16', cover: 'https://picsum.photos/seed/g9/200/200' },
  { name: 'K-Pop',     color: '#06B6D4', cover: 'https://picsum.photos/seed/g10/200/200' },
  { name: 'Folk',      color: '#A78BFA', cover: 'https://picsum.photos/seed/g11/200/200' },
  { name: 'Podcasts',  color: '#FB923C', cover: 'https://picsum.photos/seed/g12/200/200' },
]

export default function Search() {
  const [query, setQuery] = useState('')
  const { play } = usePlayerStore()

  const results = query.length > 1
    ? DEMO_TRACKS.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.artist.toLowerCase().includes(query.toLowerCase()))
    : []

  return (
    <div className="fade-in" style={{ paddingBottom: 40 }}>
      <h1 className="section-title" style={{ fontSize: '1.75rem', marginBottom: 24 }}>Search</h1>

      <input
        className="input-glass"
        style={{ maxWidth: 560, fontSize: '1rem', marginBottom: 40 }}
        placeholder="🔍  Artists, songs, or podcasts"
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
      />

      {results.length > 0 ? (
        <section style={{ marginBottom: 40 }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>Results</h2>
          {results.map((t, i) => (
            <div key={t.id} className={`track-row`} onClick={() => play(t, results)}>
              <span className="track-num">{i+1}</span>
              <img src={t.cover} alt={t.title} className="track-thumb" />
              <div className="track-info">
                <div className="track-title">{t.title}</div>
                <div className="track-artist">{t.artist}</div>
              </div>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>{t.album}</span>
              <span className="track-duration">{`${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}`}</span>
            </div>
          ))}
        </section>
      ) : (
        <>
          <h2 className="section-title" style={{ marginBottom: 20 }}>Browse all</h2>
          <div className="home-categories">
            {GENRES.map(g => (
              <div
                key={g.name}
                className="home-category-card"
                style={{
                  background: `linear-gradient(135deg, ${g.color}bb, ${g.color}44)`,
                }}
              >
                <span className="home-category-name">{g.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
