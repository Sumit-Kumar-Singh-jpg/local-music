import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { colors, gradients, radii, spacing, typography } from '@/theme/tokens'

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore()
  const { accentColor } = useThemeStore()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)

  const handleLogin = async (e = email, p = password) => {
    if (!e || !p) return Alert.alert('Error', 'Please enter email and password')
    const result = await login(e, p)
    if (result.success) {
      router.replace('/(tabs)')
    } else {
      Alert.alert('Login Failed', result.error ?? 'Invalid credentials')
    }
  }

  return (
    <LinearGradient colors={['#0e0e13', '#1a0a2e', '#0e0e13']} style={styles.container}>
      {/* Glow blobs */}
      <View style={[styles.blobPurple, { backgroundColor: `${accentColor}22` }]} />
      <View style={styles.blobPink} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Text style={styles.logoIcon}>🎵</Text>
            <Text style={styles.logoText}>Local Music</Text>
            <Text style={styles.logoSub}>100M+ tracks · HiFi quality · Free forever</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tabs */}
            <View style={styles.tabs}>
              {['Sign In', 'Sign Up'].map((t, i) => (
                <TouchableOpacity 
                  key={t} 
                  style={[styles.tab, isSignup === !!i && { backgroundColor: `${accentColor}22` }]} 
                  onPress={() => setIsSignup(!!i)}
                >
                  <Text style={[styles.tabText, isSignup === !!i && { color: accentColor, fontWeight: '700' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fields */}
            {isSignup && (
              <TextInput style={styles.input} placeholder="Your name" placeholderTextColor={colors.textMuted}
                autoCapitalize="words" selectionColor={accentColor} />
            )}
            <TextInput
              style={styles.input} placeholder="Email address" placeholderTextColor={colors.textMuted}
              value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
              selectionColor={accentColor}
            />
            <TextInput
              style={styles.input} placeholder="Password" placeholderTextColor={colors.textMuted}
              value={password} onChangeText={setPassword} secureTextEntry
              selectionColor={accentColor}
            />

            {/* Submit */}
            <TouchableOpacity onPress={() => handleLogin()} activeOpacity={0.85} disabled={isLoading}>
              <View style={[styles.btnPrimary, { backgroundColor: accentColor }]}>
                {isLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnPrimaryText}>{isSignup ? 'Create Account' : 'Sign In'}</Text>
                }
              </View>
            </TouchableOpacity>

            <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>or try demo</Text><View style={styles.dividerLine} /></View>

            {/* Demo quick-login */}
            <TouchableOpacity style={styles.btnDemo} onPress={() => handleLogin('admin@localmusic.app','admin123')} activeOpacity={0.8}>
              <Text style={styles.btnDemoIcon}>⚙</Text>
              <View>
                <Text style={styles.btnDemoTitle}>Login as Admin</Text>
                <Text style={styles.btnDemoSub}>admin@localmusic.app</Text>
              </View>
              <Text style={[styles.btnDemoIcon, { marginLeft: 'auto', color: accentColor }]}>ADMIN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnDemo} onPress={() => handleLogin('user@localmusic.app','user123')} activeOpacity={0.8}>
              <Text style={styles.btnDemoIcon}>🎵</Text>
              <View>
                <Text style={styles.btnDemoTitle}>Login as User</Text>
                <Text style={styles.btnDemoSub}>user@localmusic.app</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  scroll:     { flexGrow: 1, justifyContent: 'center', padding: spacing[6] },
  blobPurple: { position:'absolute', top: 60,  left: -80,  width: 300, height: 300, borderRadius: 150 },
  blobPink:   { position:'absolute', bottom: 80, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(236,72,153,0.1)' },

  logoWrap: { alignItems: 'center', marginBottom: spacing[8] },
  logoIcon: { fontSize: 52 },
  logoText: { ...typography.h1, fontSize: 32, marginTop: spacing[2], color: colors.text },
  logoSub:  { ...typography.caption, marginTop: spacing[1], textAlign: 'center' },

  card:   { backgroundColor: colors.glassBg, borderColor: colors.glassBorder, borderWidth: 1, borderRadius: radii.xxl, padding: spacing[6] },
  tabs:   { flexDirection: 'row', marginBottom: spacing[5], backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radii.full, padding: 3 },
  tab:    { flex: 1, paddingVertical: 8, borderRadius: radii.full, alignItems: 'center' },
  tabText:   { ...typography.bodyMd, color: colors.textMuted },

  input: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderColor: colors.glassBorder, borderWidth: 1,
    borderRadius: radii.lg, color: colors.text, fontSize: 15, padding: spacing[4],
    marginBottom: spacing[3],
  },

  btnPrimary:     { borderRadius: radii.full, paddingVertical: 16, alignItems: 'center', marginTop: spacing[2] },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  divider:     { flexDirection: 'row', alignItems: 'center', marginVertical: spacing[5] },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.glassBorder },
  dividerText: { ...typography.caption, marginHorizontal: spacing[3] },

  btnDemo:      { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.glassBorder, borderWidth: 1, borderRadius: radii.xl, padding: spacing[4], marginBottom: spacing[3] },
  btnDemoIcon:  { fontSize: 20 },
  btnDemoTitle: { ...typography.bodyMd, color: colors.text },
  btnDemoSub:   { ...typography.caption },
})
