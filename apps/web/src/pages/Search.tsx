import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { musicApi } from '../lib/api'
import { usePlayerStore, getCoverUrl } from '../store/playerStore'

const GENRES = [
  { name: 'Pop',       image: 'https://images.unsplash.com/photo-1514525253361-bee8a18744ad?q=80&w=400' },
  { name: 'Hip-Hop',   image: 'https://images.unsplash.com/photo-1571609832127-4d1872473293?q=80&w=400' },
  { name: 'Electronic',image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400' },
  { name: 'R&B',       image: 'https://images.unsplash.com/photo-1605722243479-4ad4b30121bd?q=80&w=400' },
  { name: 'Rock',      image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400' },
  { name: 'Jazz',      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a621?q=80&w=400' },
  { name: 'Classical', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=400' },
  { name: 'Country',   image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=400' },
  { name: 'Latin',     image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef52784?q=80&w=400' },
  { name: 'K-Pop',     image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=400' },
  { name: 'Folk',      image: 'https://images.unsplash.com/photo-1459749411177-042180ce6b9c?q=80&w=400' },
  { name: 'Ambient',   image: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=400' },
]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(searchParams.get('genre'))
  const { play } = usePlayerStore()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      musicApi.search(query || selectedGenre || ' ', selectedGenre || undefined).then(res => setResults(res.results)).catch(console.error)
      if (query.length > 1) {
        musicApi.suggestions(query).then(res => {
          setSuggestions(res.results)
          setShowSuggestions(true)
        }).catch(console.error)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, selectedGenre])

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.title)
    setShowSuggestions(false)
  }

  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre)
    setSearchParams({ genre })
    setQuery('')
  }

  const clearGenre = () => {
    setSelectedGenre(null)
    setSearchParams({})
    setQuery('')
    setResults([])
  }

  const handleTrackClick = (t: any) => {
    play(t, results)
    navigate('/now-playing')
  }


  return (
    <div className="fade-in" style={{ paddingBottom: 40 }}>
      {/* Section Header */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h1 className="section-title" style={{ fontSize: '1.75rem' }}>
          {selectedGenre ? `Genre: ${selectedGenre}` : 'Search'}
        </h1>
        {selectedGenre && (
          <button className="btn-glass btn" onClick={clearGenre}>Back to Browse</button>
        )}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', maxWidth: 560, marginBottom: 40 }}>
        <input
          className="input-glass"
          style={{ width: '100%', fontSize: '1.1rem', padding: '14px 20px' }}
          placeholder="🔍  Artists, songs, or podcasts"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            if (e.target.value) setSelectedGenre(null)
          }}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          autoFocus
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions glass-heavy fade-in" style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            left: 0,
            right: 0,
            zIndex: 100,
            borderRadius: 'var(--radius-xl)',
            padding: '8px 0',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            {suggestions.slice(0, 8).map((s) => (
              <div 
                key={s.id} 
                className="suggestion-item" 
                onClick={() => {
                  handleSuggestionClick(s)
                  handleTrackClick(s)
                }}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  {getCoverUrl(s) ? (
                    <img 
                      src={getCoverUrl(s)} 
                      alt={s.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('solaris-placeholder');
                      }}
                    />
                  ) : <div className="solaris-placeholder" style={{ width: '100%', height: '100%' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="truncate" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{s.title}</div>
                  <div className="truncate" style={{ fontSize: '0.8rem', opacity: 0.6 }}>{s.artistName}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results or Categories */}
      {results.length > 0 ? (
        <section className="fade-in">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <h2 className="section-title">Results</h2>
            <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{results.length} tracks found</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {results.map((t, i) => (
              <div key={t.id} className="track-row glass-low" onClick={() => handleTrackClick(t)}>
                <span className="track-num" style={{ width: 32 }}>{i+1}</span>
                <div className="track-thumb-wrap" style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                  {getCoverUrl(t) ? (
                    <img 
                      src={getCoverUrl(t)} 
                      alt={t.title} 
                      className="track-thumb" 
                      style={{ width: '100%', height: '100%' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('solaris-placeholder');
                      }}
                    />
                  ) : <div className="solaris-placeholder" style={{ width: '100%', height: '100%' }} />}
                </div>
                <div className="track-info" style={{ flex: 2 }}>
                  <div className="track-title truncate" style={{ fontWeight: 600 }}>{t.title}</div>
                  <div className="track-artist truncate" style={{ fontSize: '0.85rem', opacity: 0.7 }}>{t.artistName || t.artist?.name || t.artist}</div>
                </div>
                <div className="text-secondary truncate hide-mobile" style={{ flex: 1, fontSize: '0.85rem', opacity: 0.5 }}>
                  {t.albumTitle || t.album?.title || t.album || 'Single'}
                </div>
                <span className="track-duration" style={{ width: 60, textAlign: 'right' }}>
                  {t.duration ? `${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}` : '--:--'}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="fade-in">
          <h2 className="section-title" style={{ marginBottom: 24, fontSize: '1.25rem' }}>Browse Genres</h2>
          <div className="genre-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
            gap: '16px' 
          }}>
            {GENRES.map(g => (
              <div
                key={g.name}
                className="category-card"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${g.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  aspectRatio: '1/1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
                onClick={() => handleGenreClick(g.name)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.6)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                }}
              >
                <span className="category-name" style={{ 
                  fontSize: '1rem', 
                  fontWeight: 800, 
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textShadow: '0 4px 15px rgba(0,0,0,1)',
                  position: 'relative',
                  zIndex: 2
                }}>{g.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
