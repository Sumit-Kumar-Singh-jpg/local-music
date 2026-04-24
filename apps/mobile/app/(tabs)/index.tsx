import { useEffect, useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { usePlayerStore, DEMO_TRACKS } from '@/store/playerStore'
import { useAuthStore } from '@/store/authStore'
import { useLibraryStore } from '@/store/libraryStore'
import { useThemeStore } from '@/store/themeStore'
import { musicApi } from '@/lib/api'
import { colors, gradients, spacing, radii, typography, layout } from '@/theme/tokens'
import { Track } from '@shared/types/track'

const { width } = Dimensions.get('window')

const GENRES = [
  { label: 'Pop',     color: '#A855F7', emoji: '' },
  { label: 'Hip-Hop', color: '#EC4899', emoji: '' },
  { label: 'Electronic',color: '#3B82F6', emoji: '' },
  { label: 'R&B',     color: '#10B981', emoji: '' },
  { label: 'Rock',    color: '#F59E0B', emoji: '' },
  { label: 'Jazz',    color: '#EF4444', emoji: '' },
]

function PlayingBars({ color }: { color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 }}>
      <View style={{ width: 3, height: 16, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ width: 3, height: 10, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ width: 3, height: 14, backgroundColor: color, borderRadius: 2 }} />
    </View>
  )
}

function TrackCard({ track, onPress, isPlayingSelf, accentColor }: { track: Track; onPress: () => void; isPlayingSelf: boolean; accentColor: string }) {
  return (
    <TouchableOpacity style={styles.trackCard} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: track.coverUrl || track.cover }} style={styles.trackThumb} contentFit="cover" />
      <LinearGradient colors={['transparent', 'rgba(14,14,19,0.85)']} style={StyleSheet.absoluteFill} />
      
      {isPlayingSelf ? (
        <View style={styles.playOverlay}>
          <PlayingBars color={accentColor} />
        </View>
      ) : (
        track.hifi && (
          <View style={styles.hifiBadge}>
            <LinearGradient colors={gradients.primary} style={styles.hifiBadgeInner}>
              <Text style={styles.hifiText}>HiFi</Text>
            </LinearGradient>
          </View>
        )
      )}

      <View style={styles.trackCardInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>{track.artistName}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const { play, track: nowTrack, isPlaying } = usePlayerStore()
  const { user } = useAuthStore()
  const { toggleLike, isLiked } = useLibraryStore()
  const { accentColor } = useThemeStore()
  
  const [trending, setTrending] = useState<Track[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const fetchTrending = async () => {
    try {
      const res = await musicApi.trending()
      setTrending(res.tracks)
    } catch (err) {
      setTrending(DEMO_TRACKS)
    }
  }

  useEffect(() => {
    fetchTrending()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchTrending()
    setRefreshing(false)
  }

  const handleLike = (trackId: string) => {
    toggleLike(trackId)
  }

  const featured = trending[0] || DEMO_TRACKS[0]
  const discoverTracks = trending.slice(0, 4)

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={{ paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => (router as any).openDrawer()}>
              <Text style={{ fontSize: 24, color: '#fff' }}>☰</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} 👋</Text>
              <Text style={styles.username}>{user?.name ?? 'Listener'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Image source={{ uri: user?.avatarUrl || user?.avatar }} style={[styles.avatar, { borderColor: accentColor }]} contentFit="cover" />
          </TouchableOpacity>
        </View>

        {/* Featured hero */}
        <TouchableOpacity style={styles.hero} activeOpacity={0.9} onPress={() => play(featured, trending)}>
          <Image source={{ uri: featured.coverUrl || featured.cover }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={['rgba(14,14,19,0.1)','rgba(14,14,19,0.9)']} style={StyleSheet.absoluteFill} />
          <View style={styles.heroContent}>
            <Text style={[styles.heroLabel, { color: accentColor }]}>FEATURED TRACK</Text>
            <Text style={styles.heroTitle}>{featured.title}</Text>
            <Text style={styles.heroArtist}>{featured.artistName}</Text>
            
            <View style={{ flexDirection: 'row', gap: spacing[3], marginTop: spacing[2] }}>
              <View style={[styles.heroBtn, { backgroundColor: accentColor }]}>
                <Text style={styles.heroBtnText}>▶  Play</Text>
              </View>
              <TouchableOpacity style={[styles.heroLikeBtn, isLiked(featured.id) && { borderColor: accentColor }]} onPress={() => handleLike(featured.id)}>
                <Text style={{ color: isLiked(featured.id) ? accentColor : colors.textMuted, fontSize: 16 }}>
                  {isLiked(featured.id) ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Recently played */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recently Played</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/library')}><Text style={{ color: accentColor }}>See all</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[3], paddingHorizontal: spacing[6] }}>
            {trending.slice(0, 6).map(t => (
              <TrackCard 
                key={t.id} 
                track={t} 
                onPress={() => play(t, trending)} 
                isPlayingSelf={nowTrack?.id === t.id && isPlaying}
                accentColor={accentColor} 
              />
            ))}
          </ScrollView>
        </View>

        {/* Discover Weekly Hero */}
        {discoverTracks.length === 4 && (
          <View style={[styles.section, { paddingHorizontal: spacing[6] }]}>
            <View style={styles.discoverCard}>
              <View style={{ flex: 1, padding: spacing[4], justifyContent: 'center' }}>
                <Text style={typography.caption}>🎵 Discover Weekly</Text>
                <Text style={[typography.h2, { fontSize: 20, marginTop: 4 }]}>Your personal</Text>
                <Text style={[typography.h2, { fontSize: 20, color: accentColor }]}>mixtape</Text>
                <Text style={[typography.caption, { marginTop: spacing[3], marginBottom: spacing[3] }]}>{trending.length} songs curated just for you</Text>
                
                <TouchableOpacity style={[styles.heroBtn, { backgroundColor: accentColor, alignSelf: 'flex-start' }]} onPress={() => play(discoverTracks[0], discoverTracks)}>
                  <Text style={styles.heroBtnText}>▶ Play Now</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.discoverGrid}>
                {discoverTracks.map(t => (
                  <Image key={t.id} source={{ uri: t.cover }} style={styles.discoverImg} contentFit="cover" />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Genres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Genres</Text>
          <View style={styles.genreGrid}>
            {GENRES.map(g => (
              <TouchableOpacity 
                key={g.label} 
                style={[styles.genreCard, { backgroundColor: g.color + '33' }]} 
                activeOpacity={0.8}
                onPress={() => router.push(`/search?q=${g.label}`)}
              >
                <Text style={styles.genreLabel}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending Now */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Now 🔥</Text>
          {trending.slice(0, 10).map((t, i) => {
            const isActive = nowTrack?.id === t.id
            const isSelfPlaying = isActive && isPlaying
            
            return (
              <TouchableOpacity key={t.id} style={[styles.listRow, isActive && { backgroundColor: `${accentColor}11` }]} onPress={() => play(t, trending)} activeOpacity={0.8}>
                <View style={{ width: 24, alignItems: 'center' }}>
                  {isSelfPlaying ? <PlayingBars color={accentColor} /> : <Text style={styles.listNum}>{i + 1}</Text>}
                </View>
                <Image source={{ uri: t.coverUrl || t.cover }} style={styles.listThumb} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listTitle, isActive && { color: accentColor }]} numberOfLines={1}>{t.title}</Text>
                  <Text style={styles.listArtist} numberOfLines={1}>{t.artistName}</Text>
                </View>
                
                <Text style={[styles.listAlbum, { flex: 0.5 }]} numberOfLines={1}>Single</Text>
                
                <TouchableOpacity onPress={() => handleLike(t.id)} style={{ paddingHorizontal: spacing[3] }}>
                  <Text style={{ color: isLiked(t.id) ? accentColor : colors.textMuted, fontSize: 16 }}>{isLiked(t.id) ? '♥' : '♡'}</Text>
                </TouchableOpacity>

                <Text style={styles.listDuration}>{Math.floor(t.duration/60)}:{String(t.duration%60).padStart(2,'0')}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[6], paddingTop: spacing[4], paddingBottom: spacing[5] },
  greeting: { ...typography.caption, marginBottom: 2 },
  username: { ...typography.h2, fontSize: 20 },
  avatar:   { width: 40, height: 40, borderRadius: radii.full, borderWidth: 2 },

  hero: { height: 260, marginHorizontal: spacing[6], borderRadius: radii.xxl, overflow: 'hidden', marginBottom: spacing[6] },
  heroContent: { position: 'absolute', bottom: spacing[5], left: spacing[5], right: spacing[5] },
  heroLabel:  { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  heroTitle:  { ...typography.h2, fontSize: 26, color: '#fff', marginBottom: 2 },
  heroArtist: { ...typography.bodyMd, color: 'rgba(255,255,255,0.7)' },
  heroBtn:    { borderRadius: radii.full, paddingHorizontal: 24, paddingVertical: 12, justifyContent: 'center' },
  heroBtnText:{ color: '#fff', fontWeight: '700', fontSize: 14 },
  heroLikeBtn: { borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radii.full, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  section:      { marginBottom: spacing[6] },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[6], marginBottom: spacing[4] },
  sectionTitle: { ...typography.h3, paddingHorizontal: spacing[6], marginBottom: spacing[4] },

  trackCard:     { width: 140, height: 140, borderRadius: radii.xl, overflow: 'hidden' },
  trackThumb:    { ...StyleSheet.absoluteFillObject },
  trackCardInfo: { position: 'absolute', bottom: spacing[3], left: spacing[3], right: spacing[3] },
  trackTitle:    { fontSize: 13, fontWeight: '700', color: '#fff' },
  trackArtist:   { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  hifiBadge:     { position: 'absolute', top: 8, right: 8, borderRadius: radii.full, overflow: 'hidden' },
  hifiBadgeInner:{ paddingHorizontal: 6, paddingVertical: 2 },
  hifiText:      { fontSize: 9, fontWeight: '800', color: '#fff' },
  playOverlay:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },

  discoverCard: { flexDirection: 'row', backgroundColor: colors.glassBg, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.glassBorder },
  discoverGrid: { width: 140, flexDirection: 'row', flexWrap: 'wrap' },
  discoverImg:  { width: 70, height: 70 },

  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3], paddingHorizontal: spacing[6] },
  genreCard:  { width: (width - spacing[6]*2 - spacing[3]*2) / 3, borderRadius: radii.md, paddingVertical: spacing[3], paddingHorizontal: spacing[2], alignItems: 'center' },
  genreLabel: { fontWeight: '700', fontSize: 13, color: '#fff' },

  listRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3], paddingHorizontal: spacing[6] },
  listNum:     { ...typography.caption, fontWeight: '700' },
  listThumb:   { width: 48, height: 48, borderRadius: radii.md },
  listTitle:   { ...typography.bodyMd, color: colors.text },
  listArtist:  { ...typography.caption, marginTop: 2 },
  listAlbum:   { ...typography.caption, display: 'none' }, // In future, if album title exists in payload
  listDuration:{ ...typography.caption, width: 35, textAlign: 'right' },
})
