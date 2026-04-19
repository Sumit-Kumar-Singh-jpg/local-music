import { useState, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { debounce } from 'lodash'; // or just manual setTimeout
import { usePlayerStore, DEMO_TRACKS } from '../../src/store/playerStore'
import { searchApi } from '../../src/lib/api'
import { colors, spacing, radii, typography, layout, gradients } from '../../src/theme/tokens'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

const GENRES = [
  { label: 'Hip-Hop',   color: '#A855F7' }, { label: 'Pop',       color: '#EC4899' },
  { label: 'R&B',       color: '#3B82F6' }, { label: 'Indie',     color: '#10B981' },
  { label: 'EDM',       color: '#F59E0B' }, { label: 'Jazz',      color: '#6366F1' },
  { label: 'Rock',      color: '#EF4444' }, { label: 'Classical', color: '#8B5CF6' },
]

type ResultItem = {
  id: string
  type: 'track' | 'artist'
  title?: string
  name?: string
  artistName?: string
  score?: number
}

export default function SearchScreen() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<ResultItem[]>([])
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState(false)
  const { play } = usePlayerStore()

  // Local fallback filter
  const localResults = query.trim()
    ? DEMO_TRACKS.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.artist.toLowerCase().includes(query.toLowerCase()) ||
        t.album.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const doSearch = async (q: string) => {
    if (!q.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    try {
      // Try Elasticsearch backend first (global search across tracks + artists)
      const data = await searchApi.search(q)
      setResults(data.results as ResultItem[])
      setApiError(false)
    } catch {
      // Backend not running — use local data silently
      setApiError(true)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (text: string) => {
    setQuery(text)
    if (!text.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    // Debounce 400ms
    setTimeout(() => doSearch(text), 400)
  }

  // What to show in results list
  const displayResults = apiError || results.length === 0 ? localResults.map(t => ({
    id: t.id, type: 'track' as const, title: t.title, artistName: t.artist,
    cover: t.cover, album: t.album, hifi: t.hifi,
    _local: t,
  })) : results

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.heading}>Search</Text>

        {/* Elasticsearch badge */}
        <View style={styles.esBadge}>
          <Text style={styles.esBadgeText}>⚡ Powered by Elasticsearch</Text>
          <View style={[styles.esDot, { backgroundColor: apiError ? '#EF4444' : '#10B981' }]} />
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Artists, songs, albums, genres…"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={handleChange}
            autoCapitalize="none"
          />
          {loading
            ? <ActivityIndicator size="small" color={colors.primary} />
            : query.length > 0
              ? <TouchableOpacity onPress={() => { setQuery(''); setResults([]) }}>
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              : null
          }
        </View>

        {query ? (
          <>
            <Text style={styles.resultLabel}>
              {apiError ? '📦 Local results' : '⚡ Elasticsearch'} · {displayResults.length} result{displayResults.length !== 1 ? 's' : ''} for "{query}"
            </Text>
            <FlatList
              data={displayResults}
              keyExtractor={(item: any) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 16 }}
              renderItem={({ item }: any) => {
                const isArtist = item.type === 'artist'
                const localTrack = DEMO_TRACKS.find(t => t.id === item.id) ?? item._local
                return (
                  <TouchableOpacity
                    style={styles.resultRow}
                    onPress={() => !isArtist && localTrack && play(localTrack, DEMO_TRACKS)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.resultThumbWrap, isArtist && styles.resultThumbRound]}>
                      {localTrack?.cover
                        ? <Image source={{ uri: localTrack.cover }} style={styles.resultThumb} contentFit="cover" />
                        : <View style={[styles.resultThumb, { backgroundColor: colors.surfaceHigh, justifyContent:'center', alignItems:'center' }]}>
                            <Text style={{ fontSize: 24 }}>{isArtist ? '🎤' : '🎵'}</Text>
                          </View>
                      }
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.resultTitle} numberOfLines={1}>
                          {item.title ?? item.name}
                        </Text>
                        {isArtist && (
                          <View style={styles.artistBadge}><Text style={styles.artistBadgeText}>ARTIST</Text></View>
                        )}
                      </View>
                      <Text style={styles.resultSub} numberOfLines={1}>
                        {item.artistName ?? (isArtist ? 'Artist Profile' : item.album)}
                        {item.score != null && ` · score: ${item.score?.toFixed(2)}`}
                      </Text>
                    </View>
                    {localTrack?.hifi && <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>HiFi</Text>}
                    {!isArtist && <Text style={{ color: colors.textMuted, fontSize: 20 }}>▶</Text>}
                  </TouchableOpacity>
                )
              }}
            />
          </>
        ) : (
          <>
            <Text style={styles.browseLabel}>Browse all</Text>
            <View style={styles.genreGrid}>
              {GENRES.map(g => (
                <TouchableOpacity
                  key={g.label}
                  style={[styles.genreCard, { backgroundColor: g.color }]}
                  onPress={() => handleChange(g.label)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.genreText}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing[6] },
  heading:   { ...typography.h1, marginBottom: spacing[2], marginTop: spacing[4] },

  esBadge:     { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] },
  esBadgeText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  esDot:       { width: 8, height: 8, borderRadius: 4 },

  searchBar:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: colors.surfaceHigh, borderRadius: radii.full, paddingHorizontal: spacing[4], paddingVertical: 12, marginBottom: spacing[4] },
  searchIcon:  { fontSize: 20, color: colors.textMuted },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },

  resultLabel: { ...typography.caption, marginBottom: spacing[3] },
  resultRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3] },
  resultThumbWrap: { overflow: 'hidden', borderRadius: radii.md },
  resultThumbRound: { borderRadius: radii.full },
  resultThumb: { width: 52, height: 52 },
  resultTitle: { ...typography.bodyMd, color: colors.text },
  resultSub:   { ...typography.caption, marginTop: 2 },

  artistBadge:     { backgroundColor: 'rgba(168,85,247,0.15)', borderRadius: radii.full, paddingHorizontal: 6, paddingVertical: 2 },
  artistBadgeText: { fontSize: 9, fontWeight: '800', color: colors.primary, letterSpacing: 0.8 },

  browseLabel: { ...typography.h3, marginBottom: spacing[4] },
  genreGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  genreCard:   { width: (width - spacing[6]*2 - spacing[3]) / 2, height: 80, borderRadius: radii.xl, justifyContent: 'center', paddingLeft: spacing[4] },
  genreText:   { fontSize: 16, fontWeight: '800', color: '#fff' },
})
