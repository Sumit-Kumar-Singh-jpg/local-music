import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useAuthStore } from '../../src/store/authStore'
import { colors, spacing, radii, typography, gradients, layout } from '../../src/theme/tokens'

const SETTINGS = [
  { icon: '🎵', label: 'Audio Quality', sub: 'HiFi Lossless' },
  { icon: '📥', label: 'Downloads',     sub: '0 songs offline' },
  { icon: '📱', label: 'Device Sync',   sub: '1 device connected' },
  { icon: '🔔', label: 'Notifications', sub: 'On' },
  { icon: '🔒', label: 'Privacy',       sub: 'Manage data' },
  { icon: '❓', label: 'Help & Support', sub: '' },
]

export default function ProfileScreen() {
  const { user, logout } = useAuthStore()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20 }}>
        {/* Header */}
        <LinearGradient colors={['rgba(168,85,247,0.2)', 'rgba(14,14,19,0)']} style={styles.headerGrad}>
          <Image source={{ uri: user?.avatar }} style={styles.avatar} contentFit="cover" />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{user?.role?.toUpperCase()}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: 'rgba(245,158,11,0.2)', borderColor: 'rgba(245,158,11,0.3)' }]}>
              <Text style={[styles.badgeText, { color: '#F59E0B' }]}>{user?.plan?.toUpperCase()}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Upgrade banner (free users) */}
        {user?.plan === 'free' && (
          <TouchableOpacity style={styles.upgradeBanner} activeOpacity={0.9}>
            <LinearGradient colors={gradients.primary} style={styles.upgradeBannerGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
              <View>
                <Text style={styles.upgradeTitle}>✨ Upgrade to Premium</Text>
                <Text style={styles.upgradeSub}>HiFi audio · Offline · No limits</Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 22 }}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.stats}>
          {[['247', 'Following'], ['1.2K', 'Followers'], ['89', 'Playlists']].map(([v, l]) => (
            <View key={l} style={styles.stat}>
              <Text style={styles.statVal}>{v}</Text>
              <Text style={styles.statLabel}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Settings list */}
        <View style={styles.settingsCard}>
          {SETTINGS.map((s, i) => (
            <TouchableOpacity key={s.label} style={[styles.settingRow, i < SETTINGS.length - 1 && styles.settingRowBorder]} activeOpacity={0.7}>
              <Text style={{ fontSize: 20 }}>{s.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>{s.label}</Text>
                {s.sub ? <Text style={styles.settingSub}>{s.sub}</Text> : null}
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Log out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login') } }
          ])}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  headerGrad: { alignItems: 'center', paddingTop: spacing[8], paddingBottom: spacing[6], paddingHorizontal: spacing[6] },
  avatar: { width: 96, height: 96, borderRadius: radii.full, borderWidth: 3, borderColor: colors.primary, marginBottom: spacing[4] },
  name:   { ...typography.h2, marginBottom: spacing[1] },
  email:  { ...typography.caption, marginBottom: spacing[3] },
  badges: { flexDirection: 'row', gap: spacing[2] },
  badge:  { backgroundColor: 'rgba(168,85,247,0.2)', borderColor: 'rgba(168,85,247,0.3)', borderWidth: 1, borderRadius: radii.full, paddingHorizontal: spacing[3], paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 0.8 },

  upgradeBanner:    { marginHorizontal: spacing[6], marginBottom: spacing[4], borderRadius: radii.xl, overflow: 'hidden' },
  upgradeBannerGrad:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[4] },
  upgradeTitle:     { fontSize: 15, fontWeight: '700', color: '#fff' },
  upgradeSub:       { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  stats:     { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing[4], marginHorizontal: spacing[6], backgroundColor: colors.glassBg, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.glassBorder, marginBottom: spacing[5] },
  stat:      { alignItems: 'center' },
  statVal:   { ...typography.h3, color: colors.primary },
  statLabel: { ...typography.caption, marginTop: 2 },

  settingsCard: { marginHorizontal: spacing[6], backgroundColor: colors.glassBg, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.glassBorder, marginBottom: spacing[5], overflow: 'hidden' },
  settingRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[4] },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
  settingLabel: { ...typography.bodyMd, color: colors.text },
  settingSub:   { ...typography.caption, marginTop: 2 },

  logoutBtn:  { marginHorizontal: spacing[6], padding: spacing[4], backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: radii.xl, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
})
