import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { usePlayerStore } from '@/store/playerStore'
import { useLibraryStore } from '@/store/libraryStore'
import { useThemeStore } from '@/store/themeStore'
import { playlistApi } from '@/lib/api'
import { colors, gradients, spacing, radii, typography, layout } from '@/theme/tokens'

const { width } = Dimensions.get('window')

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams()
  const { play, track: nowTrack, isPlaying } = usePlayerStore()
  const { toggleLike, isLiked } = useLibraryStore()
  const { accentColor } = useThemeStore()
  
  const [playlist, setPlaylist] = useState<any>(null)
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await playlistApi.get(id as string)
        setPlaylist(res.playlist)
        setTracks(res.playlist?.tracks || [])
      } catch (err) {
        console.error('Failed to fetch playlist:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlaylist()
  }, [id])

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={accentColor} size="large" />
      </View>
    )
  }

  if (!playlist) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: spacing[6] }]}>
        <Text style={{ ...typography.h3, color: colors.textMuted }}>Playlist not found</Text>
        <TouchableOpacity style={{ marginTop: spacing[4] }} onPress={() => router.back()}>
          <Text style={{ color: accentColor }}>Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20 }}>
        {/* Banner with Back Button */}
        <View style={styles.header}>
           <Image source={{ uri: playlist.coverArt || `https://picsum.photos/seed/${id}/600/600` }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={20} />
           <LinearGradient colors={['rgba(14,14,19,0.4)', 'rgba(14,14,19,1)']} style={StyleSheet.absoluteFill} />
           
           <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={16}>
             <Text style={{ color: '#fff', fontSize: 24 }}>⇠</Text>
           </TouchableOpacity>

           <View style={styles.headerContent}>
             <Image source={{ uri: playlist.coverArt || `https://picsum.photos/seed/${id}/600/600` }} style={styles.mainCover} contentFit="cover" />
             <Text style={styles.title} numberOfLines={2}>{playlist.name}</Text>
             <Text style={styles.description} numberOfLines={2}>{playlist.description || 'Custom collection'}</Text>
             <Text style={styles.meta}>{tracks.length} songs · {Math.floor(tracks.reduce((acc, t) => acc + (t.duration || 0), 0) / 60)} min</Text>
           </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.playBtn} 
            activeOpacity={0.8}
            onPress={() => tracks.length > 0 && play(tracks[0], tracks)}
          >
            <LinearGradient colors={gradients.primary} style={[styles.playBtnGrad, { backgroundColor: accentColor }]} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Text style={styles.playBtnText}>▶  Play All</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCircle} onPress={() => toggleLike(id as string)}>
            <Text style={{ color: isLiked(id as string) ? accentColor : colors.text, fontSize: 24 }}>
              {isLiked(id as string) ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCircle}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Track List */}
        <View style={styles.trackList}>
          {tracks.map((t, i) => {
             const isActive = nowTrack?.id === t.id
             const isSelfPlaying = isActive && isPlaying

             return (
              <TouchableOpacity 
                key={t.id} 
                style={[styles.trackRow, isActive && { backgroundColor: `${accentColor}11` }]}
                onPress={() => play(t, tracks)}
                activeOpacity={0.7}
              >
                <View style={{ width: 24, alignItems: 'center' }}>
                  {isSelfPlaying ? (
                    <View style={styles.playingBars}>
                       <View style={[styles.bar, { backgroundColor: accentColor }]} />
                       <View style={[styles.bar, { backgroundColor: accentColor, height: 12 }]} />
                       <View style={[styles.bar, { backgroundColor: accentColor }]} />
                    </View>
                  ) : (
                    <Text style={styles.trackNum}>{i + 1}</Text>
                  )}
                </View>
                <Image source={{ uri: t.album?.coverArt || t.cover || 'https://picsum.photos/200' }} style={styles.trackThumb} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.trackTitle, isActive && { color: accentColor }]} numberOfLines={1}>{t.title}</Text>
                  <Text style={styles.trackArtist}>{t.artist?.name || t.artistName || 'Unknown'}</Text>
                </View>
                <Text style={styles.trackDuration}>{Math.floor(t.duration/60)}:{String(t.duration%60).padStart(2,'0')}</Text>
              </TouchableOpacity>
             )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { height: 450, justifyContent: 'flex-end', padding: spacing[6] },
  backBtn: { position: 'absolute', top: 56, left: spacing[6], width: 44, height: 44, borderRadius: radii.full, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  headerContent: { alignItems: 'center' },
  mainCover: { width: 200, height: 200, borderRadius: radii.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 20, marginBottom: spacing[6] },
  title: { ...typography.h1, textAlign: 'center', fontSize: 32, color: '#fff', marginBottom: 4 },
  description: { ...typography.body, textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 8 },
  meta: { ...typography.label, textAlign: 'center', color: 'rgba(255,255,255,0.4)' },

  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], paddingHorizontal: spacing[6], marginVertical: spacing[6] },
  playBtn: { flex: 1, height: 56, borderRadius: radii.full, overflow: 'hidden' },
  playBtnGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  playBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  actionCircle: { width: 56, height: 56, borderRadius: radii.full, backgroundColor: colors.glassBg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.glassBorder },

  trackList: { paddingHorizontal: spacing[2] },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], paddingVertical: spacing[3], paddingHorizontal: spacing[4], borderRadius: radii.lg },
  trackNum: { width: 24, textAlign: 'center', color: colors.textMuted, fontSize: 13 },
  trackThumb: { width: 48, height: 48, borderRadius: radii.md },
  trackTitle: { ...typography.bodyMd, color: colors.text, fontWeight: '600' },
  trackArtist: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  trackDuration: { ...typography.caption, color: colors.textMuted, width: 35, textAlign: 'right' },

  playingBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 3, height: 8, borderRadius: 1 }
})
