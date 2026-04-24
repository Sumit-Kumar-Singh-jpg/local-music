import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SyncEvent, ConnectedDevice } from '@shared/types/sync'

const DEVICE_ID_KEY = 'lm-device-id'
const DEVICE_NAME_KEY = 'lm-device-name'

// Generate random ID for device
function generateDeviceId(): string {
  return `mobile-${Math.random().toString(36).slice(2, 10)}`
}

interface SyncState {
  connectedDevices: ConnectedDevice[]
  isSyncEnabled: boolean
  myDeviceName: string
  myDeviceId: string | null

  init: () => Promise<void>
  destroy: () => void
  publish: (event: Omit<SyncEvent, 'deviceId' | 'deviceName' | 'platform' | 'timestamp'>) => void
  transferTo: (deviceId: string) => void
  toggleSync: () => void
  setDeviceName: (name: string) => Promise<void>
}

export const useSyncStore = create<SyncState>((set, get) => ({
  connectedDevices: [],
  isSyncEnabled: true,
  myDeviceName: 'My Phone',
  myDeviceId: null,

  init: async () => {
    try {
      let id = await AsyncStorage.getItem(DEVICE_ID_KEY)
      if (!id) {
        id = generateDeviceId()
        await AsyncStorage.setItem(DEVICE_ID_KEY, id)
      }
      
      const name = await AsyncStorage.getItem(DEVICE_NAME_KEY)
      set({ myDeviceId: id, myDeviceName: name || 'My Phone' })
      
      // Future: connect WebSocket here
    } catch (e) {
      console.error('Failed to init sync store:', e)
    }
  },

  destroy: () => {
    set({ connectedDevices: [] })
    // Future: disconnect WebSocket
  },

  publish: (partial) => {
    // Future: send event via WebSocket
  },

  transferTo: (deviceId) => {
    // Future: implement handoff
  },

  toggleSync: () => set(s => ({ isSyncEnabled: !s.isSyncEnabled })),

  setDeviceName: async (name: string) => {
    const trimmed = name.trim() || 'My Phone'
    await AsyncStorage.setItem(DEVICE_NAME_KEY, trimmed)
    set({ myDeviceName: trimmed })
  },
}))
