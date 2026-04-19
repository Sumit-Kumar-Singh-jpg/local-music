import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { usePlayerStore, DEMO_TRACKS } from '../../src/store/playerStore'
import { useAuthStore } from '../../src/store/authStore'
import { colors, gradients, spacing, radii, typography, layout } from '../../src/theme/tokens'

const { width } = Dimensions.get('window')

const GENRES = [
  { label: 'Hip-Hop', color: '#A855F7', emoji: '🎤' },
  { label: 'Pop',     color: '#EC4899', emoji: '🎶' },
  { label: 'R&B',     color: '#3B82F6', emoji: '🎸' },
  { label: 'Indie',   color: '#10B981', emoji: '🪗' },
  { label: 'EDM',     color: '#F59E0B', emoji: '🎧' },
  { label: 'Jazz',    color: '#6366F1', emoji: '🎷' },
]

function TrackCard({ track, onPress }: { track: typeof DEMO_TRACKS[0]; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.trackCard} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: track.cover }} style={styles.trackThumb} contentFit="cover" />
      <LinearGradient colors={['transparent', 'rgba(14,14,19,0.85)']} style={StyleSheet.absoluteFill} />
      {track.hifi && (
        <View style={styles.hifiBadge}><LinearGradient colors={gradients.primary} style={styles.hifiBadgeInner}><Text style={styles.hifiText}>HiFi</Text></LinearGradient></View>
      )}
      <View style={styles.trackCardInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const { play } = usePlayerStore()
  const { user } = useAuthStore()
  const featured = DEMO_TRACKS[0]

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} 👋</Text>
            <Text style={styles.username}>{user?.name ?? 'Listener'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Image source={{ uri: user?.avatar }} style={styles.avatar} contentFit="cover" />
          </TouchableOpacity>
        </View>

        {/* Featured hero */}
        <TouchableOpacity style={styles.hero} activeOpacity={0.9} onPress={() => play(featured, DEMO_TRACKS)}>
          <Image source={{ uri: featured.cover }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={['rgba(14,14,19,0.1)','rgba(14,14,19,0.85)']} style={StyleSheet.absoluteFill} />
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>FEATURED MIX</Text>
            <Text style={styles.heroTitle}>{featured.title}</Text>
            <Text style={styles.heroArtist}>{featured.artist}</Text>
            <LinearGradient colors={gradients.primary} style={styles.heroBtn} start={{x:0,y:0}} end={{x:1,y:0}}>
              <Text style={styles.heroBtnText}>▶  Play Now</Text>
            </LinearGradient>
          </View>
        </TouchableOpacity>

        {/* Recently played */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[3], paddingRight: spacing[6] }}>
            {DEMO_TRACKS.slice(0, 6).map(t => (
              <TrackCard key={t.id} track={t} onPress={() => play(t, DEMO_TRACKS)} />
            ))}
          </ScrollView>
        </View>

        {/* Genres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Genres</Text>
          <View style={styles.genreGrid}>
            {GENRES.map(g => (
              <TouchableOpacity key={g.label} style={[styles.genreCard, { backgroundColor: g.color + '22', borderColor: g.color + '44' }]} activeOpacity={0.8}>
                <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
                <Text style={[styles.genreLabel, { color: g.color }]}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          {DEMO_TRACKS.slice(0, 5).map((t, i) => (
            <TouchableOpacity key={t.id} style={styles.listRow} onPress={() => play(t, DEMO_TRACKS)} activeOpacity={0.8}>
              <Text style={styles.listNum}>{i + 1}</Text>
              <Image source={{ uri: t.cover }} style={styles.listThumb} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle} numberOfLines={1}>{t.title}</Text>
                <Text style={styles.listArtist} numberOfLines={1}>{t.artist}</Text>
              </View>
              {t.hifi && <Text style={{ fontSize: 10, color: colors.primary }}>HiFi</Text>}
              <Text style={styles.listDuration}>{Math.floor(t.duration/60)}:{String(t.duration%60).padStart(2,'0')}</Text>
            </TouchableOpacity>
          ))}
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
  avatar:   { width: 40, height: 40, borderRadius: radii.full, borderWidth: 2, borderColor: colors.primary },

  hero: { height: 240, marginHorizontal: spacing[6], borderRadius: radii.xxl, overflow: 'hidden', marginBottom: spacing[6] },
  heroContent: { position: 'absolute', bottom: spacing[5], left: spacing[5], right: spacing[5] },
  heroLabel:  { fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 1.5, marginBottom: 4 },
  heroTitle:  { ...typography.h2, fontSize: 24, color: '#fff', marginBottom: 2 },
  heroArtist: { ...typography.bodyMd, color: 'rgba(255,255,255,0.7)', marginBottom: spacing[4] },
  heroBtn:    { alignSelf: 'flex-start', borderRadius: radii.full, paddingHorizontal: 20, paddingVertical: 10 },
  heroBtnText:{ color: '#fff', fontWeight: '700', fontSize: 14 },

  section:      { marginBottom: spacing[6] },
  sectionTitle: { ...typography.h3, paddingHorizontal: spacing[6], marginBottom: spacing[4] },

  trackCard:     { width: 140, height: 140, borderRadius: radii.xl, overflow: 'hidden', marginLeft: spacing[6] },
  trackThumb:    { ...StyleSheet.absoluteFillObject },
  trackCardInfo: { position: 'absolute', bottom: spacing[3], left: spacing[3], right: spacing[3] },
  trackTitle:    { fontSize: 13, fontWeight: '700', color: '#fff' },
  trackArtist:   { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  hifiBadge:     { position: 'absolute', top: 8, right: 8, borderRadius: radii.full, overflow: 'hidden' },
  hifiBadgeInner:{ paddingHorizontal: 6, paddingVertical: 2 },
  hifiText:      { fontSize: 9, fontWeight: '800', color: '#fff' },

  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3], paddingHorizontal: spacing[6] },
  genreCard:  { width: (width - spacing[6]*2 - spacing[3]) / 2, borderRadius: radii.xl, borderWidth: 1, padding: spacing[4], alignItems: 'center', gap: spacing[2] },
  genreLabel: { fontWeight: '700', fontSize: 15 },

  listRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3], paddingHorizontal: spacing[6] },
  listNum:     { width: 24, textAlign: 'center', ...typography.caption, fontWeight: '700' },
  listThumb:   { width: 48, height: 48, borderRadius: radii.md },
  listTitle:   { ...typography.bodyMd, color: colors.text },
  listArtist:  { ...typography.caption, marginTop: 2 },
  listDuration:{ ...typography.caption },
})
