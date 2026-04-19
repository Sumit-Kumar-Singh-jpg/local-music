import { useEffect, useState } from 'react'
import { healthCheck } from '../../lib/api'

interface HealthState {
  status: 'checking' | 'online' | 'offline'
  timestamp: string
}

export default function ApiStatus() {
  const [health, setHealth] = useState<HealthState>({ status: 'checking', timestamp: '' })

  useEffect(() => {
    const check = async () => {
      const result = await healthCheck()
      setHealth({
        status: result.status === 'ok' ? 'online' : 'offline',
        timestamp: result.timestamp,
      })
    }
    check()
    const interval = setInterval(check, 30_000) // poll every 30s
    return () => clearInterval(interval)
  }, [])

  const dot = {
    checking: { color: '#F59E0B', label: 'API…' },
    online:   { color: '#10B981', label: 'API Online' },
    offline:  { color: '#EF4444', label: 'API Offline' },
  }[health.status]

  return (
    <div
      title={health.timestamp ? `Last checked: ${new Date(health.timestamp).toLocaleTimeString()}` : 'Checking…'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '0.75rem',
        color: 'var(--color-on-surface-variant)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        userSelect: 'none',
      }}
    >
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: dot.color,
        boxShadow: `0 0 6px ${dot.color}`,
        flexShrink: 0,
        animation: health.status === 'online' ? 'pulse-glow 2s ease infinite' : 'none',
      }} />
      <span>{dot.label}</span>
    </div>
  )
}
