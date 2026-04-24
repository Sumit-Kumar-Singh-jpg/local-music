import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { usePlayerStore } from '@/store/playerStore'
import { useThemeStore } from '@/store/themeStore'
import { musicApi } from '@/lib/api'
import { colors, gradients, spacing, radii, typography, layout } from '@/theme/tokens'

const { width } = Dimensions.get('window')

export default function ArtistScreen() {
  const { id } = useLocalSearchParams()
  const { play, track: nowTrack, isPlaying } = usePlayerStore()
  const { accentColor } = useThemeStore()
  
  const [artist, setArtist] = useState<any>(null)
  const [topTracks, setTopTracks] = useState<any[]>([])
  const [albums, setAlbums] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const res = await musicApi.getArtist(id as string)
        setArtist(res.artist)
        setTopTracks(res.artist?.tracks || [])
        setAlbums(res.artist?.albums || [])
      } catch (err) {
        console.error('Failed to fetch artist:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchArtist()
  }, [id])

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={accentColor} size="large" />
      </View>
    )
  }

  if (!artist) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: spacing[6] }]}>
        <Text style={{ ...typography.h3, color: colors.textMuted }}>Artist not found</Text>
        <TouchableOpacity style={{ marginTop: spacing[4] }} onPress={() => router.back()}>
          <Text style={{ color: accentColor }}>Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20 }}>
        {/* Banner */}
        <View style={styles.banner}>
           <Image source={{ uri: artist.banner || artist.image || artist.coverImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
           <LinearGradient colors={['rgba(14,14,19,0.2)', 'rgba(14,14,19,1)']} style={StyleSheet.absoluteFill} />
           
           <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={16}>
             <Text style={{ color: '#fff', fontSize: 24 }}>⇠</Text>
           </TouchableOpacity>

           <View style={styles.bannerContent}>
             <Text style={styles.name} numberOfLines={2}>{artist.name}</Text>
             <Text style={styles.listeners}>{artist.monthlyListeners ? `${(artist.monthlyListeners / 1000).toFixed(1)}K monthly listeners` : ''}</Text>
           </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.playBtn} 
            activeOpacity={0.8}
            onPress={() => topTracks.length > 0 && play(topTracks[0], topTracks)}
          >
            <LinearGradient colors={gradients.primary} style={[styles.playBtnGrad, { backgroundColor: accentColor }]} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Text style={styles.playBtnText}>▶  Shuffle Play</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.followBtn, following && { borderColor: accentColor }]} 
            onPress={() => setFollowing(!following)}
          >
            <Text style={[styles.followBtnText, following && { color: accentColor }]}>
              {following ? '✓ Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Popular Tracks */}
        {topTracks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular</Text>
            {topTracks.slice(0, 5).map((t, i) => {
              const isActive = nowTrack?.id === t.id
              return (
                <TouchableOpacity 
                  key={t.id} 
                  style={[styles.trackRow, isActive && { backgroundColor: `${accentColor}11` }]}
                  onPress={() => play(t, topTracks)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.trackNum}>{i + 1}</Text>
                  <Image source={{ uri: t.cover || t.album?.coverArt || 'https://picsum.photos/200' }} style={styles.trackThumb} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.trackTitle, isActive && { color: accentColor }]} numberOfLines={1}>{t.title}</Text>
                    <Text style={styles.trackMeta}>{t.playCount ? `${(t.playCount/1000000).toFixed(1)}M plays` : 'Trending'}</Text>
                  </View>
                  <Text style={styles.trackDuration}>{Math.floor(t.duration/60)}:{String(t.duration%60).padStart(2,'0')}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Discography */}
        {albums.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discography</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[4], paddingHorizontal: spacing[6] }}>
              {albums.map(alb => (
                <TouchableOpacity key={alb.id} style={styles.albumCard} onPress={() => router.push(`/album/${alb.id}`)}>
                  <Image source={{ uri: alb.coverArt || alb.cover || 'https://picsum.photos/seed/disc/400/400' }} style={styles.albumThumb} contentFit="cover" />
                  <Text style={styles.albumTitle} numberOfLines={1}>{alb.title}</Text>
                  <Text style={styles.albumYear}>{alb.releaseDate ? new Date(alb.releaseDate).getFullYear() : 'Album'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* About */}
        {artist.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.aboutCard}>
              <Text style={styles.bio} numberOfLines={6}>{artist.bio}</Text>
              <TouchableOpacity style={{ marginTop: 12 }}>
                <Text style={{ color: accentColor, fontWeight: '700' }}>Read More</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  banner: { height: 350, justifyContent: 'flex-end', padding: spacing[6] },
  backBtn: { position: 'absolute', top: 56, left: spacing[6], width: 44, height: 44, borderRadius: radii.full, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  bannerContent: { },
  name: { ...typography.h1, fontSize: 44, color: '#fff', marginBottom: 4 },
  listeners: { ...typography.bodyMd, color: 'rgba(255,255,255,0.7)' },

  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], paddingHorizontal: spacing[6], paddingVertical: spacing[5] },
  playBtn: { flex: 1, height: 52, borderRadius: radii.full, overflow: 'hidden' },
  playBtnGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  playBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  followBtn: { paddingHorizontal: 24, height: 52, borderRadius: radii.full, borderWidth: 1, borderColor: colors.glassBorder, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.glassBg },
  followBtnText: { color: colors.text, fontWeight: '700' },

  section: { marginTop: spacing[6] },
  sectionTitle: { ...typography.h3, paddingHorizontal: spacing[6], marginBottom: spacing[4] },

  trackRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], paddingVertical: spacing[3], paddingHorizontal: spacing[6] },
  trackNum: { width: 20, color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  trackThumb: { width: 48, height: 48, borderRadius: radii.md },
  trackTitle: { ...typography.bodyMd, color: colors.text, fontWeight: '600' },
  trackMeta: { ...typography.caption, marginTop: 2 },
  trackDuration: { ...typography.caption, color: colors.textMuted },

  albumCard: { width: 140 },
  albumThumb: { width: 140, height: 140, borderRadius: radii.lg, marginBottom: 8 },
  albumTitle: { ...typography.bodyMd, color: colors.text },
  albumYear: { ...typography.caption, marginTop: 2 },

  aboutCard: { marginHorizontal: spacing[6], backgroundColor: colors.glassBg, borderRadius: radii.xl, padding: spacing[4], overflow: 'hidden', borderWidth: 1, borderColor: colors.glassBorder },
  bio: { ...typography.body, color: colors.textMuted, lineHeight: 22 }
})
