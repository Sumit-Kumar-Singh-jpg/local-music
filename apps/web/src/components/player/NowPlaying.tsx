import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore, formatTime } from '../../store/playerStore'
import { useSyncStore } from '../../store/syncStore'
import DeviceSync from '../ui/DeviceSync'
import './NowPlaying.css'

export default function NowPlayingBar() {
  const {
    track, isPlaying, progress, volume, shuffle, repeat, isMuted,
    togglePlay, next, prev, seek, setVolume, toggleShuffle, toggleRepeat, toggleMute,
  } = usePlayerStore()
  const { connectedDevices } = useSyncStore()
  const navigate = useNavigate()
  const [showDeviceSync, setShowDeviceSync] = useState(false)

  // Total = this device + others seen via BroadcastChannel
  const deviceCount = 1 + connectedDevices.length

  if (!track) return <div className="now-playing-bar glass-heavy" />

  const elapsed   = Math.floor(progress * track.duration)
  const volumeVal = isMuted ? 0 : volume

  return (
    <>
      <div className="now-playing-bar glass-heavy">
        {/* Left: Track info */}
        <div className="now-playing-left" onClick={() => navigate('/now-playing')}>
          <img src={track.cover} alt={track.title} className="now-playing-cover" />
          <div className="now-playing-info">
            <span className="now-playing-title truncate">{track.title}</span>
            <span className="now-playing-artist truncate">{track.artist}</span>
          </div>
          <button className="btn-icon now-playing-heart" onClick={e => e.stopPropagation()}>♡</button>
          {track.hifi && <span className="badge badge-hifi">HiFi</span>}
        </div>

        {/* Center: Controls + Seek */}
        <div className="now-playing-center">
          <div className="now-playing-controls">
            <button
              className={`btn-icon${shuffle ? ' active-ctrl' : ''}`}
              onClick={toggleShuffle}
              title="Shuffle"
            >⇄</button>
            <button className="btn-icon" onClick={prev} title="Previous">⏮</button>
            <button className="btn-play-large" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="btn-icon" onClick={next} title="Next">⏭</button>
            <button
              className={`btn-icon${repeat !== 'off' ? ' active-ctrl' : ''}`}
              onClick={toggleRepeat}
              title="Repeat"
            >{repeat === 'one' ? '🔂' : '⇆'}</button>
          </div>

          <div className="now-playing-seek">
            <span className="now-playing-time">{formatTime(elapsed)}</span>
            <div
              className="seek-bar"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                seek((e.clientX - rect.left) / rect.width)
              }}
            >
              <div className="seek-progress" style={{ width: `${progress * 100}%` }}>
                <div className="seek-thumb" />
              </div>
            </div>
            <span className="now-playing-time">{formatTime(track.duration)}</span>
          </div>
        </div>

        {/* Right: Volume + Devices + Full screen */}
        <div className="now-playing-right">
          <button className="btn-icon" onClick={toggleMute} title="Volume">
            {volumeVal === 0 ? '🔇' : volumeVal < 0.5 ? '🔉' : '🔊'}
          </button>
          <div
            className="seek-bar volume-bar"
            style={{ width: 90 }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setVolume((e.clientX - rect.left) / rect.width)
            }}
          >
            <div className="seek-progress" style={{ width: `${volumeVal * 100}%` }}>
              <div className="seek-thumb" />
            </div>
          </div>

          {/* Device Sync Button */}
          <button
            className={`btn-icon device-sync-btn${deviceCount > 1 ? ' has-devices' : ''}`}
            onClick={() => setShowDeviceSync(true)}
            title={`${deviceCount} device${deviceCount !== 1 ? 's' : ''} connected`}
          >
            <span>📱</span>
            {deviceCount > 1 && (
              <span className="device-count-badge">{deviceCount}</span>
            )}
          </button>

          <button className="btn-icon" onClick={() => navigate('/now-playing')} title="Full screen">⛶</button>
        </div>
      </div>

      {/* Device Sync Panel */}
      {showDeviceSync && <DeviceSync onClose={() => setShowDeviceSync(false)} />}
    </>
  )
}
