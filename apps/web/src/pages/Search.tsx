import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { musicApi } from '../lib/api'
import { usePlayerStore } from '../store/playerStore'

const GENRES = [
  { name: 'Pop',       color: '#A855F7' }, { name: 'Hip-Hop',   color: '#EC4899' },
  { name: 'Electronic',color: '#3B82F6' }, { name: 'R&B',       color: '#10B981' },
  { name: 'Rock',      color: '#F59E0B' }, { name: 'Jazz',      color: '#EF4444' },
  { name: 'Classical', color: '#6366F1' }, { name: 'Country',   color: '#F97316' },
  { name: 'Latin',     color: '#84CC16' }, { name: 'K-Pop',     color: '#06B6D4' },
  { name: 'Folk',      color: '#A78BFA' }, { name: 'Ambient',   color: '#FB923C' },
]

export default function Search() {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<any[]>([])
  const { play } = usePlayerStore()

  useEffect(() => {
    if (query.length > 1) {
      const timer = setTimeout(() => {
        musicApi.search(query).then(res => setResults(res.results)).catch(console.error)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setResults([])
    }
  }, [query])

  const handleGenreClick = (genre: string) => {
    setQuery(genre)
  }

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
              <img src={t.album?.coverArt || t.cover || 'https://picsum.photos/200'} alt={t.title} className="track-thumb" />
              <div className="track-info">
                <div className="track-title">{t.title}</div>
                <div className="track-artist">{t.artistName || t.artist?.name || t.artist}</div>
              </div>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>{t.albumTitle || t.album?.title || t.album}</span>
              <span className="track-duration">{t.duration ? `${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}` : '--'}</span>
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
                  cursor: 'pointer',
                }}
                onClick={() => handleGenreClick(g.name)}
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
