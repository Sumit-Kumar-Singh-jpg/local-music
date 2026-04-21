import { Drawer } from 'expo-router/drawer'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from '../src/store/authStore'
import { colors } from '../src/theme/tokens'
import '../src/services/playbackService' // Initialize playback logic

export default function RootLayout() {
  const { user } = useAuthStore()

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: colors.bg,
            width: 280,
          },
          drawerActiveTintColor: colors.primary,
          drawerInactiveTintColor: colors.textMuted,
          drawerType: 'front',
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Home',
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="(auth)/login"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  )
}
