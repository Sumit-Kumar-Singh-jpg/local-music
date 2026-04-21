import { useState, useCallback, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Dimensions, ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { usePlayerStore } from '@/store/playerStore'
import { useThemeStore } from '@/store/themeStore'
import { searchApi } from '@/lib/api'
import { colors, spacing, radii, typography, layout } from '@/theme/tokens'

const { width } = Dimensions.get('window')

const GENRES = [
  { label: 'Pop',       color: '#A855F7' }, { label: 'Hip-Hop',   color: '#EC4899' },
  { label: 'Electronic',color: '#3B82F6' }, { label: 'R&B',       color: '#10B981' },
  { label: 'Indie',     color: '#F59E0B' }, { label: 'Jazz',      color: '#EF4444' },
  { label: 'Rock',      color: '#6366F1' }, { label: 'Classical', color: '#8B5CF6' },
]

export default function SearchScreen() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<any[]>([])
  const [loading, setLoading]   = useState(false)
  const { play, track: nowTrack, isPlaying } = usePlayerStore()
  const { accentColor } = useThemeStore()

  const doSearch = async (q: string) => {
    if (!q.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    try {
      const data = await searchApi.search(q)
      setResults(data.results || [])
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) doSearch(query)
      else setResults([])
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  const handleResultPress = (item: any) => {
    if (item.type === 'artist') {
      router.push(`/artist/${item.id}`)
    } else if (item.type === 'album') {
      router.push(`/album/${item.id}`)
    } else {
      // It's a track
      const tracks = results.filter(r => r.type === 'track')
      play(item, tracks)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.heading}>Search</Text>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Artists, songs, albums..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            selectionColor={accentColor}
          />
          {loading && <ActivityIndicator size="small" color={accentColor} />}
          {!loading && query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: colors.textMuted, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {query ? (
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20 }}
            ListEmptyComponent={!loading ? (
              <View style={styles.emptyState}>
                <Text style={{ color: colors.textMuted }}>No results for "{query}"</Text>
              </View>
            ) : null}
            renderItem={({ item }) => {
              const isArtist = item.type === 'artist'
              const isActive = item.id === nowTrack?.id
              
              return (
                <TouchableOpacity
                  style={[styles.resultRow, isActive && { backgroundColor: `${accentColor}11` }]}
                  onPress={() => handleResultPress(item)}
                  activeOpacity={0.8}
                >
                  <Image 
                    source={{ uri: item.cover || item.image || item.coverArt || 'https://picsum.photos/200' }} 
                    style={[styles.resultThumb, isArtist && { borderRadius: radii.full }]} 
                    contentFit="cover" 
                  />
                  
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.resultTitle, isActive && { color: accentColor }]} numberOfLines={1}>
                      {item.title || item.name}
                    </Text>
                    <Text style={styles.resultSub} numberOfLines={1}>
                      {isArtist ? 'Artist' : item.type === 'album' ? 'Album' : item.artistName || item.artist?.name || 'Track'}
                    </Text>
                  </View>

                  {item.hifi && (
                    <View style={[styles.badgeHifi, { borderColor: `${accentColor}44` }]}>
                      <Text style={[styles.badgeHifiText, { color: accentColor }]}>HiFi</Text>
                    </View>
                  )}
                  
                  {!isArtist && <Text style={{ color: colors.textMuted, fontSize: 18, marginLeft: spacing[2] }}>›</Text>}
                </TouchableOpacity>
              )
            }}
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight }}>
            <Text style={styles.browseLabel}>Browse all</Text>
            <View style={styles.genreGrid}>
              {GENRES.map(g => (
                <TouchableOpacity
                  key={g.label}
                  style={[styles.genreCard, { backgroundColor: g.color + '33', borderColor: g.color + '44' }]}
                  onPress={() => setQuery(g.label)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.genreText, { color: g.color }]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing[6] },
  heading:   { ...typography.h1, marginBottom: spacing[4], marginTop: spacing[4] },

  searchBar:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radii.full, paddingHorizontal: spacing[5], paddingVertical: 14, marginBottom: spacing[6], borderWidth:1, borderColor: colors.glassBorder },
  searchIcon:  { fontSize: 22, color: colors.textMuted },
  searchInput: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '500' },

  resultRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[4], paddingVertical: spacing[3], paddingHorizontal: spacing[2], borderRadius: radii.lg },
  resultThumb: { width: 52, height: 52, borderRadius: radii.md },
  resultTitle: { ...typography.bodyMd, fontSize: 15, fontWeight: '600', color: '#fff' },
  resultSub:   { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  badgeHifi:     { borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  badgeHifiText: { fontSize: 9, fontWeight: '900' },

  browseLabel: { ...typography.h3, marginBottom: spacing[5] },
  genreGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  genreCard:   { width: (width - spacing[6]*2 - spacing[3]) / 2, height: 80, borderRadius: radii.xl, justifyContent: 'center', paddingHorizontal: spacing[4], borderWidth: 1 },
  genreText:   { fontSize: 18, fontWeight: '800' },

  emptyState: { alignItems: 'center', paddingTop: 60 },
})
