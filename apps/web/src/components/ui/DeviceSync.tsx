import { useEffect, useRef, useState } from 'react'
import { useSyncStore, MY_DEVICE_ID } from '../../store/syncStore'
import { usePlayerStore, getArtistName, getCoverUrl } from '../../store/playerStore'
import type { ConnectedDevice } from '../../../../../packages/shared/src/types/sync'
import './DeviceSync.css'

const PLATFORM_ICON: Record<string, string> = {
  web: '🌐',
  mobile: '📱',
  desktop: '🖥',
}

function DeviceCard({
  device,
  isCurrent,
  onTransfer,
}: {
  device: ConnectedDevice
  isCurrent: boolean
  onTransfer?: () => void
}) {
  const elapsed  = Date.now() - device.lastSeen
  const isRecent = elapsed < 12_000

  return (
    <div className={`device-card glass${isCurrent ? ' device-card--current' : ''}`}>
      <div className="device-card-left">
        <div className={`device-status-dot${isCurrent ? ' current' : isRecent ? ' active' : ' stale'}`} />
        <div className="device-icon">{PLATFORM_ICON[device.platform] ?? '💻'}</div>
        <div className="device-info">
          <span className="device-name">
            {device.deviceName}
            {isCurrent && <span className="badge badge-current">This device</span>}
          </span>
          {device.currentTrack ? (
            <span className="device-track truncate">
              {device.currentTrack.isPlaying ? '▶' : '⏸'} {device.currentTrack.title} · {device.currentTrack.artist}
            </span>
          ) : (
            <span className="device-track text-secondary">No track playing</span>
          )}
        </div>
      </div>
      {!isCurrent && onTransfer && (
        <button className="btn-glass device-transfer-btn" onClick={onTransfer}>
          Transfer ▶
        </button>
      )}
    </div>
  )
}

interface DeviceSyncProps {
  onClose: () => void
}

export default function DeviceSync({ onClose }: DeviceSyncProps) {
  // ← Read myDeviceName from STORE (reactive), not the module constant
  const { connectedDevices, isSyncEnabled, myDeviceName, toggleSync, transferTo, setDeviceName } = useSyncStore()
  const { track, isPlaying } = usePlayerStore()

  const [editingName, setEditingName] = useState(false)
  // ← Initialise input from reactive store value
  const [nameInput, setNameInput] = useState(myDeviceName)
  const [transferMsg, setTransferMsg] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Sync nameInput when store changes (e.g. after save)
  useEffect(() => { setNameInput(myDeviceName) }, [myDeviceName])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // My device object for display
  const myDevice: ConnectedDevice = {
    deviceId: MY_DEVICE_ID,
    deviceName: myDeviceName,        // ← reactive
    platform: 'web',
    lastSeen: Date.now(),
    currentTrack: track
      ? { id: track.id, title: track.title, artist: getArtistName(track), cover: getCoverUrl(track), progress: 0, isPlaying }
      : undefined,
  }

  const otherDevices  = connectedDevices.filter(d => d.deviceId !== MY_DEVICE_ID)
  const totalDevices  = 1 + otherDevices.length

  const handleSave = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setDeviceName(trimmed)           // persists to localStorage + updates store
    setEditingName(false)
  }

  const handleTransfer = (deviceId: string, deviceName: string) => {
    transferTo(deviceId)
    setTransferMsg(`Playback transferred to ${deviceName}`)
    setTimeout(() => setTransferMsg(null), 3000)
  }

  return (
    <div className="device-sync-overlay">
      <div className="device-sync-panel glass-heavy" ref={panelRef}>

        {/* Transfer toast */}
        {transferMsg && (
          <div className="transfer-toast">
            ✅ {transferMsg}
          </div>
        )}

        {/* Header */}
        <div className="device-sync-header">
          <div>
            <h2 className="device-sync-title">📱 Devices &amp; Sync</h2>
            <p className="device-sync-subtitle text-secondary">
              {totalDevices} device{totalDevices !== 1 ? 's' : ''} connected
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Sync toggle */}
        <div className="device-sync-toggle-row glass">
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Cross-tab Sync</div>
            <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
              Sync playback across all open browser tabs
            </div>
          </div>
          <div
            className={`sync-toggle${isSyncEnabled ? ' enabled' : ''}`}
            onClick={toggleSync}
            role="switch"
            aria-checked={isSyncEnabled}
          >
            <div className="sync-toggle-thumb" />
          </div>
        </div>

        {/* Devices list */}
        <div className="device-list">
          <DeviceCard device={myDevice} isCurrent />

          {otherDevices.length > 0 ? (
            otherDevices.map(d => (
              <DeviceCard
                key={d.deviceId}
                device={d}
                isCurrent={false}
                onTransfer={() => handleTransfer(d.deviceId, d.deviceName)}
              />
            ))
          ) : (
            <div className="device-empty glass">
              <span style={{ fontSize: '2rem' }}>🔗</span>
              <p style={{ fontWeight: 600 }}>No other devices</p>
              <p className="text-secondary" style={{ fontSize: '0.8125rem', textAlign: 'center' }}>
                Open Local Music in another tab or on your phone to see it here
              </p>
            </div>
          )}
        </div>

        {/* Rename device */}
        <div className="device-rename-section glass">
          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 8 }}>
            Rename this device
          </div>
          {editingName ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input-glass"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') setEditingName(false)
                }}
                style={{ flex: 1, fontSize: '0.875rem', padding: '8px 12px' }}
                autoFocus
                maxLength={30}
              />
              <button
                className="btn-primary btn"
                style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="btn-glass btn"
                style={{ padding: '8px 12px', fontSize: '0.875rem' }}
                onClick={() => { setNameInput(myDeviceName); setEditingName(false) }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="btn-glass btn"
              style={{ fontSize: '0.875rem', padding: '8px 14px', gap: 8 }}
              onClick={() => { setNameInput(myDeviceName); setEditingName(true) }}
            >
              ✏️ {myDeviceName}   {/* ← reads from reactive store */}
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-secondary" style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
          Sync works across browser tabs using BroadcastChannel API.<br />
          Mobile app sync coming soon via WebSocket 🚀
        </p>
      </div>
    </div>
  )
}
