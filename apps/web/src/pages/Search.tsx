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
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { play } = usePlayerStore()

  useEffect(() => {
    if (query.length > 1) {
      const timer = setTimeout(() => {
        // Main Results
        musicApi.search(query).then(res => setResults(res.results)).catch(console.error)
        
        // Autocomplete Predictions
        musicApi.suggestions(query).then(res => {
          setSuggestions(res.results)
          setShowSuggestions(true)
        }).catch(console.error)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setResults([])
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.title)
    setShowSuggestions(false)
  }

  const handleGenreClick = (genre: string) => {
    setQuery(genre)
  }

  return (
    <div className="fade-in" style={{ paddingBottom: 40 }}>
      <h1 className="section-title" style={{ fontSize: '1.75rem', marginBottom: 24 }}>Search</h1>

      <div style={{ position: 'relative', maxWidth: 560 }}>
        <input
          className="input-glass"
          style={{ width: '100%', fontSize: '1rem', marginBottom: results.length > 0 ? 40 : 10 }}
          placeholder="🔍  Artists, songs, or podcasts"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          autoFocus
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions glass-heavy fade-in" style={{
            position: 'absolute',
            top: 'calc(100% - 8px)',
            left: 0,
            right: 0,
            zIndex: 100,
            borderRadius: 'var(--radius-lg)',
            padding: '8px 0',
            marginTop: -10
          }}>
            {suggestions.map((s) => (
              <div 
                key={s.id} 
                className="suggestion-item" 
                onClick={() => handleSuggestionClick(s)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <img 
                  src={s.cover || `https://api.dicebear.com/7.x/shapes/svg?seed=${s.id}`} 
                  alt={s.title} 
                  style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="truncate" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{s.title}</div>
                  <div className="truncate" style={{ fontSize: '0.75rem', opacity: 0.6 }}>{s.artistName}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
