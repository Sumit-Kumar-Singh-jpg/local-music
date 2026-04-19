import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import './Login.css'

export default function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      const user = useAuthStore.getState().user
      navigate(user?.role === 'admin' ? '/admin' : '/')
    } catch {
      setError('Invalid email or password. Try admin@localmusic.app / admin123')
    }
  }

  const quickLogin = async (role: 'admin' | 'user') => {
    const creds = role === 'admin'
      ? { email: 'admin@localmusic.app', password: 'admin123' }
      : { email: 'user@localmusic.app', password: 'user123' }
    try {
      await login(creds.email, creds.password)
      navigate(role === 'admin' ? '/admin' : '/')
    } catch { /* ignore */ }
  }

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-bg-blob login-blob1" />
        <div className="login-bg-blob login-blob2" />
        <div className="login-hero-card glass">
          <div className="login-music-icon">♪</div>
          <h1 className="login-tagline gradient-text">Your music.<br />Your world.</h1>
          <div className="login-features">
            {['🎵 100M+ tracks', '🎧 HiFi Audio Quality', '📱 All your devices'].map(f => (
              <span key={f} className="login-feature-chip glass">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-logo">
            <span style={{ fontSize: '2rem', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>♪</span>
            <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Local Music</span>
          </div>

          <div className="login-tabs">
            {(['signin', 'signup'] as const).map(t => (
              <button
                key={t}
                className={`login-tab${tab === t ? ' active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <h2 className="login-heading">
            {tab === 'signin' ? 'Welcome back' : 'Join Local Music'}
          </h2>

          <form className="login-form" onSubmit={handleSubmit}>
            {tab === 'signup' && (
              <div className="login-field">
                <label className="login-label">Your name</label>
                <input className="input-glass" type="text" placeholder="Full name" required />
              </div>
            )}
            <div className="login-field">
              <label className="login-label">Email or username</label>
              <input
                className="input-glass"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="login-field">
              <label className="login-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-glass"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="login-eye" onClick={() => setShowPass(s => !s)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {tab === 'signin' && (
                <a href="#" className="login-forgot">Forgot password?</a>
              )}
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn-primary login-submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="login-divider"><span>or continue with</span></div>

          <div className="login-socials">
            {['G Google', ' Apple', 'f Facebook'].map(s => (
              <button key={s} className="btn-glass login-social-btn">{s}</button>
            ))}
          </div>

          {/* Quick login hints */}
          <div className="login-hints">
            <p className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: 8 }}>Demo accounts:</p>
            <button className="btn-glass login-hint-btn" onClick={() => quickLogin('admin')}>
              ⚙ Login as Admin
            </button>
            <button className="btn-glass login-hint-btn" onClick={() => quickLogin('user')}>
              ♪ Login as User
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
