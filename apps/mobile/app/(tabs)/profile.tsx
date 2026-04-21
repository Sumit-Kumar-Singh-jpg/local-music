import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'
import { useThemeStore } from '@/store/themeStore'
import { userApi } from '@/lib/api'
import { colors, spacing, radii, typography, gradients, layout } from '@/theme/tokens'
import { BillingTier } from '@shared/types/user'

const SETTINGS_SECTIONS = ['Account', 'Devices & Sync', 'Playback', 'Appearance']

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuthStore()
  const { connectedDevices, isSyncEnabled, toggleSync, myDeviceName } = useSyncStore()
  const { accentColor, setAccentColor } = useThemeStore()

  const [activeSection, setActiveSection] = useState('Account')
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const totalDevices = 1 + connectedDevices.length

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await userApi.updateProfile({ displayName })
      updateUser({
        displayName: res.user?.displayName || displayName,
        name: res.user?.name || res.user?.displayName || displayName,
      })
      Alert.alert('Success', 'Profile saved successfully!')
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save')
    }
    setSaving(false)
  }

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login') } }
    ])
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20 }}>
        
        {/* Header Tabs */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {SETTINGS_SECTIONS.map((s) => (
            <TouchableOpacity 
              key={s} 
              style={[styles.tab, s === activeSection && { backgroundColor: `${accentColor}22` }]} 
              onPress={() => setActiveSection(s)}
            >
              <Text style={[styles.tabText, s === activeSection && { color: accentColor, fontWeight: '700' }]}>
                {s} {s === 'Devices & Sync' && totalDevices > 1 ? `(${totalDevices})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.content}>
          
          {/* ACCOUNT SECTION */}
          {activeSection === 'Account' && (
            <View style={{ gap: spacing[5] }}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Profile</Text>
                
                <View style={styles.profileRow}>
                  <Image source={{ uri: user?.avatar }} style={[styles.avatar, { borderColor: accentColor }]} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{user?.name}</Text>
                    <Text style={styles.email}>@{user?.email?.split('@')[0]}</Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Display Name</Text>
                  <TextInput 
                    style={styles.input} 
                    value={displayName} 
                    onChangeText={setDisplayName} 
                    placeholderTextColor={colors.textMuted} 
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput 
                    style={[styles.input, { opacity: 0.6 }]} 
                    value={user?.email} 
                    editable={false} 
                  />
                </View>

                <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: accentColor }]} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Save Changes</Text>}
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>Subscription</Text>
                  <View style={[styles.badge, user?.plan === BillingTier.PATRON ? { backgroundColor: `${accentColor}22`, borderColor: `${accentColor}44` } : {}]}>
                    <Text style={[styles.badgeText, user?.plan === BillingTier.PATRON ? { color: accentColor } : { color: colors.textMuted }]}>
                      {user?.plan === BillingTier.PATRON ? 'PREMIUM' : 'FREE'}
                    </Text>
                  </View>
                </View>

                {['🎵 HiFi Lossless Audio', '📥 Offline Downloads', '📢 Ad-Free Experience'].map(f => (
                  <View key={f} style={styles.featureRow}>
                    <Text style={{ color: accentColor, marginRight: spacing[2] }}>✓</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}

                {user?.plan !== BillingTier.PATRON && (
                  <TouchableOpacity style={styles.upgradeBtn}>
                    <LinearGradient colors={gradients.primary} style={styles.upgradeGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                      <Text style={{ color: '#fff', fontWeight: '700' }}>✨ Upgrade to Premium</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
              
              {user?.role === 'ADMIN' && (
                <TouchableOpacity 
                  style={[styles.btnPrimary, { backgroundColor: '#A855F7', marginBottom: spacing[2], marginTop: 0 }]} 
                  onPress={() => router.push('/admin/ingest')}
                >
                  <Text style={styles.btnPrimaryText}>🛡️ Admin Control Center</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* DEVICES & SYNC SECTION */}
          {activeSection === 'Devices & Sync' && (
            <View style={{ gap: spacing[5] }}>
              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.cardTitle}>Connected Devices</Text>
                    <Text style={typography.caption}>{totalDevices} device{totalDevices !== 1 ? 's' : ''}</Text>
                  </View>
                  <TouchableOpacity style={[styles.btnSmall, { backgroundColor: isSyncEnabled ? `${colors.success}22` : `${colors.error}22` }]} onPress={toggleSync}>
                    <Text style={{ color: isSyncEnabled ? colors.success : colors.error, fontWeight: '700', fontSize: 13 }}>
                      Sync {isSyncEnabled ? 'ON' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>This Device</Text>
                <View style={styles.deviceRow}>
                  <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
                  <Text style={styles.deviceName}>📱 {myDeviceName}</Text>
                  <View style={[styles.badge, { backgroundColor: `${accentColor}22` }]}><Text style={[styles.badgeText, { color: accentColor }]}>CURRENT</Text></View>
                </View>
              </View>

              {connectedDevices.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Other Devices</Text>
                  {connectedDevices.map(d => (
                    <View key={d.deviceId} style={styles.deviceRow}>
                      <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                      <Text style={styles.deviceName}>🌐 {d.deviceName}</Text>
                      {d.currentTrack && (
                        <Text style={typography.caption}>{d.currentTrack.isPlaying ? '▶' : '⏸'} {d.currentTrack.title}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* PLAYBACK SECTION */}
          {activeSection === 'Playback' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Audio Settings</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Audio Quality</Text>
                <Text style={typography.caption}>Normal</Text>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Gapless Playback</Text>
                <Text style={typography.caption}>Coming Soon</Text>
              </View>
            </View>
          )}

          {/* APPEARANCE SECTION */}
          {activeSection === 'Appearance' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Accent Color</Text>
              <View style={styles.colorGrid}>
                {['#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'].map(color => (
                  <TouchableOpacity 
                    key={color} 
                    style={[
                      styles.colorCircle, 
                      { backgroundColor: color }, 
                      color === accentColor && styles.colorCircleActive
                    ]} 
                    onPress={() => setAccentColor(color)}
                  />
                ))}
              </View>
              <Text style={[typography.caption, { marginTop: spacing[3] }]}>Changes the primary accent color across the app.</Text>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing[6], paddingTop: spacing[5], paddingBottom: spacing[3] },
  title: { ...typography.h1 },
  
  tabsContainer: { paddingHorizontal: spacing[6], paddingBottom: spacing[4], gap: spacing[2] },
  tab: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: radii.full, backgroundColor: colors.glassBg },
  tabText: { ...typography.bodyMd, color: colors.textMuted },
  
  content: { paddingHorizontal: spacing[6] },
  
  card: { backgroundColor: colors.glassBg, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.glassBorder, padding: spacing[5], marginBottom: spacing[5] },
  cardTitle: { ...typography.h3, marginBottom: spacing[4] },
  
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], marginBottom: spacing[5] },
  avatar: { width: 72, height: 72, borderRadius: radii.full, borderWidth: 3 },
  name: { ...typography.h2, fontSize: 18, marginBottom: 2 },
  email: { ...typography.caption },
  
  inputGroup: { marginBottom: spacing[4] },
  inputLabel: { ...typography.caption, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radii.md, padding: spacing[3], color: colors.text, fontSize: 15 },
  
  btnPrimary: { borderRadius: radii.md, alignItems: 'center', padding: spacing[3], marginTop: spacing[2] },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnSmall: { paddingHorizontal: spacing[3], paddingVertical: 6, borderRadius: radii.full },
  
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] },
  badge: { borderWidth: 1, borderRadius: radii.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[3] },
  featureText: { ...typography.bodyMd, color: colors.textMuted },
  
  upgradeBtn: { marginTop: spacing[4], borderRadius: radii.md, overflow: 'hidden' },
  upgradeGrad: { padding: spacing[4], alignItems: 'center' },
  
  logoutBtn: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: radii.lg, padding: spacing[4], alignItems: 'center' },
  logoutText: { color: colors.error, fontWeight: '700', fontSize: 15 },

  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[2] },
  statusDot: { width: 8, height: 8, borderRadius: radii.full },
  deviceName: { ...typography.bodyMd, flex: 1 },

  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
  settingLabel: { ...typography.bodyMd },

  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  colorCircle: { width: 44, height: 44, borderRadius: radii.full, borderWidth: 3, borderColor: 'transparent' },
  colorCircleActive: { borderColor: '#fff' }
})
