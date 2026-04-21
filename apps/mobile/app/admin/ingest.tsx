import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { adminApi } from '@/lib/api'
import { colors, spacing, radii, typography } from '@/theme/tokens'
import { useRouter } from 'expo-router'

export default function IngestScreen() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<any[]>([])
  const router = useRouter()

  const fetchTasks = async () => {
    try {
      const res = await adminApi.getTasks()
      setTasks(res.tasks)
    } catch (err) {}
  }

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleIngest = async () => {
    if (!url) return
    setLoading(true)
    try {
      await adminApi.addPlaylist(url)
      setUrl('')
      fetchTasks()
    } catch (err: any) {
      alert('Ingestion failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const stopTask = async (id: string) => {
    try {
      await adminApi.stopTask(id)
      fetchTasks()
    } catch (err) {
      alert('Failed to stop task')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Admin Control Center</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Quick Ingest</Text>
          <Text style={styles.sublabel}>Paste Spotify Playlist/Album URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://open.spotify.com/..."
            placeholderTextColor="#666"
            value={url}
            onChangeText={setUrl}
          />
          <TouchableOpacity 
            style={[styles.btn, loading && { opacity: 0.7 }]} 
            onPress={handleIngest}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Start Ingestion</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Active Ingestions</Text>
        {tasks.map(task => (
          <View key={task.id} style={styles.taskCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskUrl} numberOfLines={1}>{task.url}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${task.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{task.progress}%</Text>
              </View>
              <Text style={styles.taskStatus}>{task.status} • {task.completedTracks}/{task.totalTracks} tracks</Text>
            </View>
            {task.status === 'RUNNING' && (
              <TouchableOpacity style={styles.stopBtn} onPress={() => stopTask(task.id)}>
                <Text style={styles.stopText}>Stop</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing[6], gap: 16 },
  back: { color: colors.text, fontSize: 24 },
  title: { ...typography.h2, fontSize: 22 },
  content: { padding: spacing[6] },
  card: { backgroundColor: colors.glassBg, padding: spacing[5], borderRadius: radii.xl, borderWidth: 1, borderColor: colors.glassBorder, marginBottom: spacing[6] },
  label: { ...typography.h3, color: '#fff' },
  sublabel: { ...typography.caption, marginBottom: spacing[4] },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radii.md, padding: 12, color: '#fff', marginBottom: spacing[4], borderWidth: 1, borderColor: colors.glassBorder },
  btn: { backgroundColor: '#A855F7', padding: 14, borderRadius: radii.md, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  sectionTitle: { ...typography.h3, marginBottom: spacing[4] },
  taskCard: { backgroundColor: colors.glassBg, padding: spacing[4], borderRadius: radii.lg, marginBottom: spacing[3], flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskUrl: { color: '#fff', fontWeight: '600', fontSize: 14 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  progressBar: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#A855F7' },
  progressText: { color: colors.textMuted, fontSize: 12 },
  taskStatus: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  stopBtn: { backgroundColor: 'rgba(239,68,68,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.sm },
  stopText: { color: '#EF4444', fontWeight: '600', fontSize: 12 }
})
