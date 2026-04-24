import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { usePlayerStore } from '@/store/playerStore'
import { useThemeStore } from '@/store/themeStore'
import { musicApi, playlistApi } from '@/lib/api'
import { colors, spacing, radii, typography, gradients, layout } from '@/theme/tokens'

const { width } = Dimensions.get('window')
const FILTERS = ['All', 'Playlists', 'Albums', 'Artists']

export default function LibraryScreen() {
  const [filter, setFilter] = useState('All')
  const { play, track: nowTrack, isPlaying } = usePlayerStore()
  const { accentColor } = useThemeStore()

  const [playlists, setPlaylists] = useState<any[]>([])
  const [recentTracks, setRecentTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const [plRes, trRes] = await Promise.all([
        playlistApi.list().catch(() => ({ playlists: [] })),
        musicApi.trending().catch(() => ({ tracks: [] })),
      ])
      setPlaylists(plRes.playlists || [])
      setRecentTracks(trRes.tracks || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleCreate = () => {
    Alert.prompt(
      'Create Playlist',
      'Enter a name for your new playlist',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create', 
          onPress: async (name) => {
            if (!name) return
            try {
              const res = await playlistApi.create(name)
              setPlaylists(prev => [res.playlist, ...prev])
            } catch (err) {
              console.error(err)
            }
          }
        }
      ],
      'plain-text'
    )
  }

  const filteredPlaylists = filter === 'All' || filter === 'Playlists' ? playlists : []
  const showRecent = (filter === 'All' || filter === 'Albums' || filter === 'Artists') && recentTracks.length > 0

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Your Library</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleCreate}>
          <LinearGradient colors={gradients.primary} style={styles.addBtnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '300', lineHeight: 28 }}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />}
      >
        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing[6], gap: spacing[2], marginBottom: spacing[5] }}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, f === filter && { backgroundColor: accentColor, borderColor: accentColor }]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, f === filter && { color: '#fff', fontWeight: '700' }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>Loading your library...</Text>
        ) : (
          <>
            {filteredPlaylists.length > 0 && (
              <View style={styles.grid}>
                {filteredPlaylists.map(pl => (
                  <TouchableOpacity key={pl.id} style={styles.gridCard} onPress={() => router.push(`/playlist/${pl.id}`)}>
                    <Image source={{ uri: pl.coverArt || `https://picsum.photos/seed/${pl.id}/200/200` }} style={styles.gridThumb} contentFit="cover" />
                    <LinearGradient colors={['transparent', 'rgba(14,14,19,0.8)']} style={StyleSheet.absoluteFill} />
                    <View style={styles.gridCardInfo}>
                      <Text style={styles.gridTitle} numberOfLines={1}>{pl.name}</Text>
                      <Text style={styles.gridSub} numberOfLines={1}>{pl.trackCount || 0} songs</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showRecent && (
              <View style={styles.recentSection}>
                <Text style={styles.recentTitle}>Recently Added</Text>
                {recentTracks.slice(0, 5).map((t, i) => {
                  const isActive = t.id === nowTrack?.id
                  return (
                    <TouchableOpacity key={t.id} style={[styles.listRow, isActive && { backgroundColor: `${accentColor}11` }]} onPress={() => play(t, recentTracks)}>
                      <Text style={styles.listNum}>{i + 1}</Text>
                      <Image source={{ uri: t.album?.coverArt || t.cover || 'https://picsum.photos/200' }} style={styles.listThumb} contentFit="cover" />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.listTitle, isActive && { color: accentColor }]} numberOfLines={1}>{t.title}</Text>
                        <Text style={styles.listArtist} numberOfLines={1}>{t.artist?.name || t.artist || 'Unknown'}</Text>
                      </View>
                      <Text style={styles.listDuration}>{Math.floor(t.duration/60)}:{String(t.duration%60).padStart(2,'0')}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}

            {filteredPlaylists.length === 0 && !showRecent && (
              <View style={styles.emptyState}>
                <Text style={[typography.h3, { color: colors.textMuted, marginBottom: spacing[2] }]}>Your library is empty</Text>
                <Text style={typography.caption}>Start liking songs and creating playlists!</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[6], paddingTop: spacing[5], paddingBottom: spacing[5] },
  heading: { ...typography.h1 },
  addBtn: { overflow: 'hidden', borderRadius: radii.full },
  addBtnGrad: { width: 40, height: 40, borderRadius: radii.full, justifyContent: 'center', alignItems: 'center' },

  chip:       { borderRadius: radii.full, backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder, paddingHorizontal: spacing[4], paddingVertical: 8 },
  chipText:   { color: colors.textMuted, fontWeight: '600', fontSize: 13 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing[6], gap: spacing[3], marginBottom: spacing[6] },
  gridCard: { width: (width - spacing[6]*2 - spacing[3]) / 2, height: (width - spacing[6]*2 - spacing[3]) / 2, borderRadius: radii.xl, overflow: 'hidden' },
  gridThumb: { ...StyleSheet.absoluteFillObject },
  gridCardInfo: { position: 'absolute', bottom: spacing[3], left: spacing[3], right: spacing[3] },
  gridTitle: { fontSize: 13, fontWeight: '700', color: '#fff' },
  gridSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  recentSection: { paddingBottom: spacing[5] },
  recentTitle: { ...typography.h3, paddingHorizontal: spacing[6], marginBottom: spacing[4] },
  listRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3], paddingHorizontal: spacing[6] },
  listNum:     { width: 24, textAlign: 'center', ...typography.caption, fontWeight: '700' },
  listThumb:   { width: 48, height: 48, borderRadius: radii.md },
  listTitle:   { ...typography.bodyMd, color: colors.text },
  listArtist:  { ...typography.caption, marginTop: 2 },
  listDuration:{ ...typography.caption, width: 40, textAlign: 'right' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: spacing[6] }
})
