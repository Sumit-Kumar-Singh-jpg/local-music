import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { usePlayerStore, DEMO_TRACKS } from '../../src/store/playerStore'
import { colors, spacing, radii, typography, gradients, layout } from '../../src/theme/tokens'

const FILTERS = ['All', 'Playlists', 'Albums', 'Artists', 'Downloads']

const PLAYLISTS = [
  { id: 'pl1', name: 'Chill Vibes',      tracks: 24, cover: 'https://picsum.photos/seed/pl1/300/300', color: '#A855F7' },
  { id: 'pl2', name: 'Late Night Drive', tracks: 18, cover: 'https://picsum.photos/seed/pl2/300/300', color: '#EC4899' },
  { id: 'pl3', name: 'Workout Hits 🔥',  tracks: 32, cover: 'https://picsum.photos/seed/pl3/300/300', color: '#3B82F6' },
  { id: 'pl4', name: 'Study Focus',      tracks: 15, cover: 'https://picsum.photos/seed/pl4/300/300', color: '#10B981' },
  { id: 'pl5', name: 'Liked Songs',      tracks: 87, cover: 'https://picsum.photos/seed/pl5/300/300', color: '#F59E0B' },
]

export default function LibraryScreen() {
  const [filter, setFilter] = useState('All')
  const { play } = usePlayerStore()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Your Library</Text>
        <TouchableOpacity style={styles.addBtn}>
          <LinearGradient colors={gradients.primary} style={styles.addBtnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '300' }}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <FlatList
        data={FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={f => f}
        contentContainerStyle={{ paddingHorizontal: spacing[6], gap: spacing[2], marginBottom: spacing[4] }}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.chip, f === filter && styles.chipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            {f === filter ? (
              <LinearGradient colors={gradients.primary} style={styles.chipGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                <Text style={styles.chipTextActive}>{f}</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.chipText}>{f}</Text>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Playlist list */}
      <FlatList
        data={PLAYLISTS}
        keyExtractor={pl => pl.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing[6], paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 16 }}
        renderItem={({ item: pl }) => (
          <TouchableOpacity style={styles.playlistRow} onPress={() => play(DEMO_TRACKS[0], DEMO_TRACKS)} activeOpacity={0.8}>
            <Image source={{ uri: pl.cover }} style={styles.playlistThumb} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.playlistName} numberOfLines={1}>{pl.name}</Text>
              <Text style={styles.playlistMeta}>{pl.tracks} songs · Playlist</Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[6], paddingTop: spacing[4], paddingBottom: spacing[4] },
  heading: { ...typography.h1 },
  addBtn: { overflow: 'hidden', borderRadius: radii.full },
  addBtnGrad: { width: 40, height: 40, borderRadius: radii.full, justifyContent: 'center', alignItems: 'center' },

  chip:       { borderRadius: radii.full, overflow: 'hidden', backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder },
  chipActive: { borderColor: 'transparent' },
  chipGrad:   { paddingHorizontal: spacing[4], paddingVertical: 8 },
  chipText:   { paddingHorizontal: spacing[4], paddingVertical: 8, color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '700', fontSize: 13 },

  playlistRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
  playlistThumb: { width: 60, height: 60, borderRadius: radii.lg },
  playlistName:  { ...typography.bodyMd, color: colors.text, marginBottom: 4 },
  playlistMeta:  { ...typography.caption },
})
