import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePlayerStore, formatTime, getArtistName, getCoverUrl } from '../../store/playerStore'
import { useSyncStore } from '../../store/syncStore'
import DeviceSync from '../ui/DeviceSync'
import './NowPlaying.css'

/**
 * Robust HTMLAudioElement manager (The "Engine")
 * Maps native audio events to our Spotify-like state machine.
 */
function AudioEngine() {
  const { track, isPlaying, volume, isMuted, progress, setProgress, setPlaybackState, next } = usePlayerStore()
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      const dur = audio.duration || 0
      const curr = audio.currentTime || 0
      const p = dur > 0 ? curr / dur : 0
      if (!isNaN(p)) setProgress(p)
    }

    const onPlay = () => setPlaybackState('playing')
    const onPause = () => setPlaybackState('paused')
    const onWaiting = () => setPlaybackState('buffering')
    const onPlaying = () => setPlaybackState('playing')
    const onEnded = () => next()
    const onError = (e: any) => {
      const errorCode = audio.error?.code
      const errorMessage = audio.error?.message || 'Unknown playback error'
      console.error('[AudioEngine] Playback error:', { errorCode, errorMessage, track: track?.title })
      
      let friendlyError = 'Playback failed. Check your connection or file format.'
      if (errorCode === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
        friendlyError = 'Format not supported or connection interrupted.'
      }
      
      setPlaybackState('error')
      usePlayerStore.getState().reportError(friendlyError, 'DECODE_ERROR')
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [setProgress, setPlaybackState, next, track?.title])

  // Handle Play/Pause Intents
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && track?.audioUrl) {
      if (audio.src !== window.location.origin + track.audioUrl && !track.audioUrl.startsWith('http')) {
         // Source changed
      }
      audio.play().catch(err => {
        if (err.name !== 'AbortError') {
          console.warn('[AudioEngine] Playback prevented:', err.message)
        }
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, track?.id, track?.audioUrl])

  // Handle Internal Sync (Seek)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audio.duration || isNaN(audio.duration)) return
    
    const targetTime = (progress || 0) * audio.duration
    // Only seek if the difference is significant (> 1s) to avoid micro-stutter
    if (Math.abs(audio.currentTime - targetTime) > 1.5) {
      audio.currentTime = targetTime
    }
  }, [progress])

  // Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : (volume || 0.8)
    }
  }, [volume, isMuted])

  return (
    <audio 
      ref={audioRef} 
      src={track?.audioUrl || ''} 
      crossOrigin="anonymous" 
      style={{ display: 'none' }} 
    />
  )
}

export default function NowPlayingBar() {
  const {
    track, playbackState, progress, volume, shuffle, repeat, isMuted,
    isSeeking, pendingProgress, setIsSeeking, setPendingProgress,
    togglePlay, next, prev, seek, setVolume, toggleShuffle, toggleRepeat, toggleMute,
  } = usePlayerStore()
  const { connectedDevices } = useSyncStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [showDeviceSync, setShowDeviceSync] = useState(false)

  const isNowPlayingPage = location.pathname === '/now-playing'

  const deviceCount = 1 + (connectedDevices?.length || 0)

  if (!track) return <div className="now-playing-bar glass-heavy" />

  const isPlaying = playbackState === 'playing'
  const isBuffering = playbackState === 'buffering'
  
  // UI Progress: Use pending if seeking, otherwise real progress
  const displayProgress = isSeeking ? pendingProgress : progress
  const elapsed = Math.floor(displayProgress * (track.duration || 0))
  const volumeVal = isMuted ? 0 : (volume || 0.8)

  const handleSeekStart = () => {
    setIsSeeking(true)
    setPendingProgress(progress)
  }

  const handleSeekChange = (val: number) => {
    setPendingProgress(val)
  }

  const handleSeekEnd = (val: number) => {
    setIsSeeking(false)
    seek(val)
  }

  return (
    <>
      <AudioEngine />

      <div className="now-playing-bar glass-heavy">
        {/* Left: Track info */}
          <div className="now-playing-left" onClick={() => navigate('/now-playing')}>
            <img src={getCoverUrl(track)} alt={track.title} className="now-playing-cover" />
            <div className="now-playing-info">
              <span className="now-playing-title truncate">{track.title}</span>
              <span className="now-playing-artist truncate">{getArtistName(track)}</span>
            </div>
            <button className="btn-icon now-playing-heart" onClick={e => e.stopPropagation()}>♡</button>
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
              
              {playbackState === 'error' ? (
                <div className="playback-error-container">
                  <span className="playback-error-msg" title={usePlayerStore.getState().error || ''}>
                    ⚠️ {usePlayerStore.getState().error?.includes('Route not found') ? 'Stream Route Missing' : (usePlayerStore.getState().error || 'File Missing')}
                  </span>
                  <button className="btn-retry" onClick={() => navigate(0)}>↻</button>
                  <button className="btn-icon" onClick={next} title="Skip Missing Track">⏭</button>
                </div>
              ) : (
                <>
                  <button className="btn-icon" style={{ background: 'var(--grad-primary)', color: '#fff', width: 40, height: 40, fontSize: '1rem', boxShadow: 'var(--shadow-glow-primary)' }} onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
                    {isBuffering ? <div className="spinner-micro" /> : (isPlaying ? '⏸' : '▶')}
                  </button>
                  <button className="btn-icon" onClick={next} title="Next">⏭</button>
                </>
              )}
              <button
                className={`btn-icon${repeat !== 'off' ? ' active-ctrl' : ''}`}
                onClick={toggleRepeat}
                title="Repeat"
              >{repeat === 'one' ? '🔂' : '⇆'}</button>
            </div>

            <div className="now-playing-seek">
              <span className="now-playing-time">{formatTime(elapsed)}</span>
              <div className="seek-bar-container">
                <input
                  type="range"
                  className="seek-bar-input"
                  min="0"
                  max="1"
                  step="0.0001"
                  value={displayProgress}
                  onMouseDown={handleSeekStart}
                  onTouchStart={handleSeekStart}
                  onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
                  onMouseUp={(e) => handleSeekEnd(parseFloat((e.target as HTMLInputElement).value))}
                  onTouchEnd={(e) => handleSeekEnd(parseFloat((e.target as HTMLInputElement).value))}
                />
                <div className="seek-bar-track">
                  <div className="seek-bar-fill" style={{ width: `${displayProgress * 100}%` }} />
                  {isBuffering && <div className="seek-bar-buffer-glow" />}
                </div>
              </div>
              <span className="now-playing-time">{formatTime(track.duration)}</span>
            </div>
          </div>

          {/* Right: Volume + Devices + Full screen + Mobile Play */}
          <div className="now-playing-right">
            <div className="volume-control">
              <button className="btn-icon" onClick={toggleMute} title="Volume">
                {volumeVal === 0 ? '🔇' : volumeVal < 0.5 ? '🔉' : '🔊'}
              </button>
              <div className="volume-bar-container">
                <input
                  type="range"
                  className="seek-bar-input volume-input"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volumeVal}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
                <div className="seek-bar-track">
                  <div className="seek-bar-fill" style={{ width: `${volumeVal * 100}%` }} />
                </div>
              </div>
            </div>

            <button
              className={`btn-icon device-sync-btn${deviceCount > 1 ? ' has-devices' : ''}`}
              onClick={() => setShowDeviceSync(true)}
              title={`${deviceCount} devices connected`}
            >
              <span>📱</span>
              {deviceCount > 1 && <span className="device-count-badge">{deviceCount}</span>}
            </button>

            {/* Simple Mobile Play/Pause */}
            <button 
              className="btn-icon mobile-only-play" 
              style={{ 
                display: window.innerWidth < 769 ? 'flex' : 'none',
                background: 'var(--grad-primary)', 
                color: '#fff', 
                width: 36, height: 36, 
                boxShadow: 'var(--shadow-glow-primary)' 
              }} 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            >
              {isBuffering ? <div className="spinner-micro" /> : (isPlaying ? '⏸' : '▶')}
            </button>

            <button className="btn-icon" onClick={() => navigate('/now-playing')} title="Full screen">⛶</button>
          </div>
        </div>

      {showDeviceSync && <DeviceSync onClose={() => setShowDeviceSync(false)} />}
    </>
  )
}
