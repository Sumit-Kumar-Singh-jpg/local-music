import { Tabs } from 'expo-router'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { usePlayerStore } from '../../src/store/playerStore'
import MiniPlayer from '../../src/components/MiniPlayer'
import { colors, radii } from '../../src/theme/tokens'

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.icon, { opacity: focused ? 1 : 0.45 }]}>{icon}</Text>
      <Text style={[styles.label, { color: focused ? colors.primary : colors.textMuted }]}>{label}</Text>
    </View>
  )
}

export default function TabsLayout() {
  const { isMiniPlayerVisible } = usePlayerStore()

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen name="index"   options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⊞" label="Home"    focused={focused} /> }} />
        <Tabs.Screen name="search"  options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⌕" label="Search"  focused={focused} /> }} />
        <Tabs.Screen name="library" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⊟" label="Library" focused={focused} /> }} />
        <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="◉" label="Profile" focused={focused} /> }} />
      </Tabs>
      {isMiniPlayerVisible && <MiniPlayer />}
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    backgroundColor: colors.surfaceMid,
    height: 64,
    elevation: 0,
  },
  tabIcon: { alignItems: 'center', gap: 3 },
  icon: { fontSize: 22 },
  label: { fontSize: 10, fontWeight: '600' },
})
