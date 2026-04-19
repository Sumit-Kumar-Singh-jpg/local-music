import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from '../src/store/authStore'
import { colors } from '../src/theme/tokens'

export default function RootLayout() {
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login')
    }
  }, [user])

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" backgroundColor={colors.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(auth)/login"  options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"        options={{ headerShown: false }} />
        <Stack.Screen name="player"        options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="album/[id]"    options={{ headerShown: false }} />
        <Stack.Screen name="artist/[id]"   options={{ headerShown: false }} />
        <Stack.Screen name="playlist/[id]" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
