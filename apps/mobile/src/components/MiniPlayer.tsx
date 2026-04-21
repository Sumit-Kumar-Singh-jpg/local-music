import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { usePlayerStore, formatTime } from '../store/playerStore'
import { colors, radii, spacing, gradients, layout } from '../theme/tokens'

export default function MiniPlayer() {
  const { track, isPlaying, progress, togglePlay, next } = usePlayerStore()
  if (!track) return null

  const elapsed = Math.floor(progress * track.duration)
  const artistText = track.artistName || 'Unknown Artist'

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['rgba(14,14,19,0)', 'rgba(14,14,19,0.98)']}
        style={styles.gradient}
        pointerEvents="none"
      />
      <TouchableOpacity activeOpacity={0.95} style={styles.container} onPress={() => router.push('/player')}>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <LinearGradient colors={gradients.primary} style={[styles.progressFill, { width: `${progress * 100}%` }]} start={{x:0,y:0}} end={{x:1,y:0}} />
        </View>

        <View style={styles.content}>
          {/* Cover */}
          <Image source={{ uri: track.cover }} style={styles.cover} contentFit="cover" />

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
            <Text style={styles.artist} numberOfLines={1}>{artistText}</Text>
          </View>

          {/* Controls */}
          <Text style={styles.time}>{formatTime(elapsed)}</Text>
          <TouchableOpacity onPress={e => { e.stopPropagation?.(); togglePlay() }} style={styles.btn} hitSlop={16}>
            <LinearGradient colors={gradients.primary} style={styles.playBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Text style={{ fontSize: 16, color: '#fff' }}>{isPlaying ? '⏸' : '▶'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={e => { e.stopPropagation?.(); next() }} style={styles.btn} hitSlop={16}>
            <Text style={styles.ctrlIcon}>⏭</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper:    { position: 'absolute', bottom: layout.tabBarHeight, left: 0, right: 0 },
  gradient:   { position: 'absolute', top: -24, left: 0, right: 0, height: 24 },
  container:  {
    backgroundColor: colors.surfaceMid,
    borderTopWidth: 1, borderTopColor: colors.glassBorder,
    marginHorizontal: spacing[3], borderRadius: radii.xl,
    marginBottom: spacing[2], overflow: 'hidden',
    ...{ shadowColor: '#000', shadowOffset: {width:0,height:-4}, shadowOpacity:0.3, shadowRadius:12, elevation:16 },
  },
  progressBar: { height: 2, backgroundColor: colors.glassBorder },
  progressFill: { height: 2 },
  content:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[3], gap: spacing[3] },
  cover:      { width: 44, height: 44, borderRadius: radii.md },
  info:       { flex: 1, minWidth: 0 },
  title:      { fontSize: 14, fontWeight: '700', color: colors.text },
  artist:     { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  time:       { fontSize: 11, color: colors.textMuted },
  btn:        {},
  ctrlIcon:   { fontSize: 20, color: colors.textMuted },
  playBtn:    { width: 40, height: 40, borderRadius: radii.full, justifyContent:'center', alignItems:'center' },
})
