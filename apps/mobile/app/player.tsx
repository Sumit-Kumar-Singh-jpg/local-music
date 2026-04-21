import { View, Text, TouchableOpacity, StyleSheet, Dimensions, PanResponder, ScrollView, LayoutChangeEvent } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { usePlayerStore, formatTime } from '@/store/playerStore'
import { useLibraryStore } from '@/store/libraryStore'
import { useThemeStore } from '@/store/themeStore'
import { colors, gradients, spacing, radii, typography } from '@/theme/tokens'
import { useRef } from 'react'

const { width } = Dimensions.get('window')

export default function PlayerScreen() {
  const {
    track, queue, isPlaying, progress, volume, shuffle, repeat, isMuted,
    togglePlay, next, prev, seek, setVolume, toggleShuffle, toggleRepeat, toggleMute, play
  } = usePlayerStore()
  const { toggleLike, isLiked } = useLibraryStore()
  const { accentColor } = useThemeStore()

  if (!track) { router.back(); return null }

  const elapsed  = Math.floor(progress * track.duration)
  const volumeVal = isMuted ? 0 : volume
  const upNext = queue.filter(t => t.id !== track.id).slice(0, 5)

  const seekBarWidthRef = useRef(width - spacing[6] * 2)

  const seekPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const x = e.nativeEvent.locationX
      seek(Math.max(0, Math.min(1, x / seekBarWidthRef.current)))
    },
    onPanResponderMove: (e) => {
      const x = e.nativeEvent.locationX
      seek(Math.max(0, Math.min(1, x / seekBarWidthRef.current)))
    },
  })

  const onSeekBarLayout = (event: LayoutChangeEvent) => {
    seekBarWidthRef.current = event.nativeEvent.layout.width || seekBarWidthRef.current
  }

  const volumeBarWidth = width - (spacing[6] * 2 + 40 + 24) // total width - (padding + icons + gap)

  const volumePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const x = e.nativeEvent.locationX
      setVolume(Math.max(0, Math.min(1, x / volumeBarWidth)))
    },
    onPanResponderMove: (e) => {
      const x = e.nativeEvent.locationX
      setVolume(Math.max(0, Math.min(1, x / volumeBarWidth)))
    },
  })

  return (
    <View style={styles.container}>
      {/* Blurred background */}
      <Image source={{ uri: track.coverUrl || track.cover }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={60} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(14,14,19,0.8)' }]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={16}>
              <Text style={{ color: colors.text, fontSize: 24 }}>⌄</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.headerLabel}>NOW PLAYING</Text>
            </View>
            <TouchableOpacity style={styles.headerBtn} hitSlop={16}>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>⋯</Text>
            </TouchableOpacity>
          </View>

          {/* Album Art (Centerpiece) */}
          <View style={styles.artSection}>
            <View style={[styles.artShadow, { shadowColor: accentColor }]}>
              <Image source={{ uri: track.cover }} style={styles.art} contentFit="cover" />
            </View>
          </View>

          {/* Track info + like */}
          <View style={styles.trackInfoSection}>
            <View style={{ flex: 1 }}>
              <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
              <Text style={styles.trackArtist} numberOfLines={1}>{track.artistName}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleLike(track.id)} hitSlop={16}>
              <Text style={{ fontSize: 28, color: isLiked(track.id) ? accentColor : colors.textMuted }}>
                {isLiked(track.id) ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Player controls (Seek, Main Controls, Volume) */}
          <View style={styles.playerControlsSection}>
            {/* Seek bar */}
            <View style={styles.seekWrap}>
              <Text style={styles.timelineLabel}>Timeline</Text>
              <View style={styles.seekBar} hitSlop={8} onLayout={onSeekBarLayout} {...seekPanResponder.panHandlers}>
                <View style={styles.seekTrack}>
                  <View style={[styles.seekFill, { width: `${progress * 100}%`, backgroundColor: accentColor }]} />
                  <View style={[styles.seekThumb, { left: `${progress * 100}%`, shadowColor: accentColor }]} />
                </View>
              </View>
              <View style={styles.seekTimes}>
                <Text style={styles.timeText}>{formatTime(elapsed)}</Text>
                <Text style={styles.timeText}>{formatTime(track.duration)}</Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity onPress={toggleShuffle} hitSlop={14}>
                <Text style={[styles.ctrlIcon, { fontSize: 22 }, shuffle && { color: accentColor }]}>⇄</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={prev} hitSlop={14}>
                <Text style={styles.ctrlIcon}>⏮</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={togglePlay} activeOpacity={0.85}>
                <LinearGradient colors={gradients.primary} style={[styles.playBtn, { shadowColor: accentColor }]} start={{x:0,y:0}} end={{x:1,y:1}}>
                  <Text style={{ fontSize: 32, color: '#fff' }}>{isPlaying ? '⏸' : '▶'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={next} hitSlop={14}>
                <Text style={styles.ctrlIcon}>⏭</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleRepeat} hitSlop={14}>
                <Text style={[styles.ctrlIcon, { fontSize: 22 }, repeat !== 'off' && { color: accentColor }]}>
                  {repeat === 'one' ? '🔂' : '⇆'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Volume */}
            <View style={styles.volumeRow}>
              <TouchableOpacity onPress={toggleMute} hitSlop={14}>
                <Text style={styles.volumeIcon}>{volumeVal === 0 ? '🔇' : '🔉'}</Text>
              </TouchableOpacity>
              <View style={styles.volumeBar} {...volumePanResponder.panHandlers}>
                <View style={styles.volumeTrack}>
                  <View style={[styles.volumeFill, { width: `${volumeVal * 100}%`, backgroundColor: accentColor }]} />
                </View>
              </View>
              <Text style={styles.volumeIcon}>🔊</Text>
            </View>
          </View>

          {/* PARITY ADDITION: Up Next Queue */}
          <View style={styles.panelSection}>
            <Text style={styles.panelTitle}>Up Next</Text>
            {upNext.length > 0 ? (
              upNext.map(qt => (
                <TouchableOpacity 
                  key={qt.id} 
                  style={styles.queueItem}
                  onPress={() => play(qt, queue)}
                >
                  <Image source={{ uri: qt.cover }} style={styles.queueCover} contentFit="cover" />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.queueTitle} numberOfLines={1}>{qt.title}</Text>
                    <Text style={styles.queueArtist} numberOfLines={1}>{qt.artistName || 'Unknown Artist'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.panelEmptyText}>No more tracks in queue</Text>
            )}
          </View>

          {/* PARITY ADDITION: Track Info */}
          <View style={styles.panelSection}>
            <Text style={styles.panelTitle}>Track Info</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Album</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{track.albumTitle || 'Single'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{formatTime(track.duration)}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] }}>
                {track.isExplicit && (
                  <View style={styles.badgeExplicit}>
                    <Text style={styles.badgeText}>Explicit</Text>
                  </View>
                )}
                {track.hifi && (
                  <View style={[styles.badgeHifi, { backgroundColor: `${accentColor}22`, borderColor: `${accentColor}44` }]}>
                    <Text style={[styles.badgeText, { color: accentColor }]}>HiFi</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[6], paddingVertical: spacing[4] },
  headerBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5 },

  artSection: { alignItems: 'center', paddingVertical: spacing[5] },
  artShadow:  { shadowOffset:{width:0,height:20}, shadowOpacity:0.6, shadowRadius:40, elevation:20 },
  art:        { width: width * 0.8, height: width * 0.8, borderRadius: radii.xxl },

  trackInfoSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[8], marginBottom: spacing[6] },
  trackTitle:       { ...typography.h1, fontSize: 26, color: '#fff' },
  trackArtist:      { ...typography.bodyMd, color: 'rgba(255,255,255,0.5)', marginTop: 4 },

  playerControlsSection: { paddingHorizontal: spacing[8], marginBottom: spacing[8] },
  
  seekWrap: { marginBottom: spacing[6] },
  timelineLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '700', marginBottom: spacing[2], textTransform: 'uppercase', letterSpacing: 0.6 },
  seekBar:  { height: 20, justifyContent: 'center' },
  seekTrack:{ height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radii.full, position: 'relative' },
  seekFill: { height: 4, borderRadius: radii.full, position: 'absolute' },
  seekThumb:{ position: 'absolute', top: -7, width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', marginLeft: -9, shadowOpacity:0.5, shadowRadius:10 },
  seekTimes:{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[1] },
  timeText: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[6] },
  ctrlIcon: { fontSize: 30, color: '#fff' },
  playBtn:  { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', shadowOpacity:0.4, shadowRadius:25, elevation:10 },

  volumeRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  volumeIcon:  { fontSize: 18, color: 'rgba(255,255,255,0.5)' },
  volumeBar:   { flex: 1, height: 20, justifyContent: 'center' },
  volumeTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radii.full },
  volumeFill:  { height: 3, borderRadius: radii.full },

  panelSection: { marginHorizontal: spacing[6], backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radii.xl, padding: spacing[5], marginBottom: spacing[5], borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  panelTitle:   { ...typography.h3, fontSize: 16, marginBottom: spacing[4], color: '#fff' },
  panelEmptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },

  queueItem:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] },
  queueCover:  { width: 44, height: 44, borderRadius: radii.md },
  queueTitle:  { fontSize: 14, fontWeight: '700', color: '#fff' },
  queueArtist: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  infoGrid:  { gap: spacing[3] },
  infoItem:  { marginBottom: spacing[1] },
  infoLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#fff' },

  badgeExplicit: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeHifi:     { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  badgeText:     { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' },
})
