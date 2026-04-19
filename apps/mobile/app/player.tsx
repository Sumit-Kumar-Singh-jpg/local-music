import { View, Text, TouchableOpacity, StyleSheet, Dimensions, PanResponder } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { usePlayerStore, formatTime } from '../src/store/playerStore'
import { colors, gradients, spacing, radii, typography } from '../src/theme/tokens'

const { width, height } = Dimensions.get('window')

export default function PlayerScreen() {
  const {
    track, isPlaying, progress, volume, shuffle, repeat, isMuted,
    togglePlay, next, prev, seek, setVolume, toggleShuffle, toggleRepeat, toggleMute,
  } = usePlayerStore()

  if (!track) { router.back(); return null }

  const elapsed  = Math.floor(progress * track.duration)
  const volumeVal = isMuted ? 0 : volume

  const seekPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const x = e.nativeEvent.locationX
      seek(Math.max(0, Math.min(1, x / seekBarWidth)))
    },
    onPanResponderMove: (e) => {
      const x = e.nativeEvent.locationX
      seek(Math.max(0, Math.min(1, x / seekBarWidth)))
    },
  })

  const seekBarWidth = width - spacing[6] * 2

  return (
    <View style={styles.container}>
      {/* Blurred background */}
      <Image source={{ uri: track.cover }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={60} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(14,14,19,0.75)' }]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={16}>
            <Text style={{ color: colors.text, fontSize: 22 }}>⌄</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerLabel}>NOW PLAYING</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} hitSlop={16}>
            <Text style={{ color: colors.text, fontSize: 22 }}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Album Art */}
        <View style={styles.artWrap}>
          <View style={styles.artShadow}>
            <Image source={{ uri: track.cover }} style={styles.art} contentFit="cover" />
          </View>
          {track.hifi && (
            <LinearGradient colors={gradients.primary} style={styles.hifiBadge} start={{x:0,y:0}} end={{x:1,y:0}}>
              <Text style={styles.hifiText}>✦ HiFi Lossless</Text>
            </LinearGradient>
          )}
        </View>

        {/* Track info + like */}
        <View style={styles.trackInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{track.artist} · {track.album}</Text>
          </View>
          <TouchableOpacity hitSlop={16}>
            <Text style={{ fontSize: 26, color: colors.textMuted }}>♡</Text>
          </TouchableOpacity>
        </View>

        {/* Seek bar */}
        <View style={styles.seekWrap}>
          <View style={styles.seekBar} hitSlop={8} {...seekPanResponder.panHandlers}>
            <View style={styles.seekTrack}>
              <LinearGradient colors={gradients.primary} style={[styles.seekFill, { width: `${progress * 100}%` }]} start={{x:0,y:0}} end={{x:1,y:0}} />
              <View style={[styles.seekThumb, { left: `${progress * 100}%` }]} />
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
            <Text style={[styles.ctrlIcon, shuffle && { color: colors.primary }]}>⇄</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={prev} hitSlop={14}>
            <Text style={styles.ctrlIcon}>⏮</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlay} activeOpacity={0.85}>
            <LinearGradient colors={gradients.primary} style={styles.playBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Text style={{ fontSize: 28, color: '#fff' }}>{isPlaying ? '⏸' : '▶'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={next} hitSlop={14}>
            <Text style={styles.ctrlIcon}>⏭</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleRepeat} hitSlop={14}>
            <Text style={[styles.ctrlIcon, repeat !== 'off' && { color: colors.primary }]}>
              {repeat === 'one' ? '🔂' : '⇆'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Volume */}
        <View style={styles.volumeRow}>
          <TouchableOpacity onPress={toggleMute} hitSlop={14}>
            <Text style={styles.volumeIcon}>{volumeVal === 0 ? '🔇' : volumeVal < 0.5 ? '🔉' : '🔊'}</Text>
          </TouchableOpacity>
          <View style={styles.volumeBar}>
            <View style={styles.volumeTrack}>
              <LinearGradient colors={gradients.primary} style={[styles.volumeFill, { width: `${volumeVal * 100}%` }]} start={{x:0,y:0}} end={{x:1,y:0}} />
            </View>
          </View>
          <Text style={styles.volumeIcon}>🔊</Text>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[6], paddingVertical: spacing[4] },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5 },

  artWrap:  { alignItems: 'center', marginTop: spacing[4], marginBottom: spacing[6] },
  artShadow:{ shadowColor: '#A855F7', shadowOffset:{width:0,height:16}, shadowOpacity:0.5, shadowRadius:32, elevation:20 },
  art:       { width: width - spacing[12], height: width - spacing[12], borderRadius: radii.xxl },
  hifiBadge: { marginTop: spacing[4], borderRadius: radii.full, paddingHorizontal: spacing[4], paddingVertical: 6 },
  hifiText:  { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.8 },

  trackInfo:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[6], marginBottom: spacing[5] },
  trackTitle:  { ...typography.h2, fontSize: 22 },
  trackArtist: { ...typography.caption, marginTop: 4 },

  seekWrap: { paddingHorizontal: spacing[6], marginBottom: spacing[5] },
  seekBar:  { marginBottom: spacing[2] },
  seekTrack:{ height: 5, backgroundColor: colors.glassBorder, borderRadius: radii.full, position: 'relative', overflow: 'visible' },
  seekFill: { height: 5, borderRadius: radii.full, position: 'absolute', top: 0, left: 0 },
  seekThumb:{ position: 'absolute', top: -6, width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', marginLeft: -9, shadowColor:'#A855F7', shadowOpacity:0.8, shadowRadius:8 },
  seekTimes:{ flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { ...typography.caption },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[6], marginBottom: spacing[6] },
  ctrlIcon: { fontSize: 26, color: colors.textMuted },
  playBtn:  { width: 72, height: 72, borderRadius: radii.full, justifyContent: 'center', alignItems: 'center', shadowColor:'#A855F7', shadowOpacity:0.5, shadowRadius:20, elevation:10 },

  volumeRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[6], gap: spacing[3] },
  volumeIcon:  { fontSize: 18 },
  volumeBar:   { flex: 1 },
  volumeTrack: { height: 4, backgroundColor: colors.glassBorder, borderRadius: radii.full },
  volumeFill:  { height: 4, borderRadius: radii.full },
})
