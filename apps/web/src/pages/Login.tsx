import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../lib/api'
import './Login.css'

export default function LoginPage() {
  const { login, register, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (tab === 'forgot') {
      try {
        await authApi.forgotPassword(identifier)
        setSuccess('If an account exists, a reset link was sent.')
      } catch {
        setError('Failed to send reset link. Please try again.')
      }
      return
    }

    if (tab === 'signup') {
      try {
        // Use generic values for required registration name if missing in MVP
        await register(name || username, identifier, password, username)
        navigate('/')
      } catch (err: any) {
        setError(err.message || 'Registration failed.')
      }
      return
    }

    try {
      await login(identifier, password)
      const user = useAuthStore.getState().user
      navigate(user?.role === 'admin' ? '/admin' : '/')
    } catch {
      setError('Invalid credentials. Please try again.')
    }
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
            {tab === 'signin' ? 'Welcome back' : tab === 'forgot' ? 'Reset Password' : 'Join Local Music'}
          </h2>

          <form className="login-form" onSubmit={handleSubmit}>
            {tab === 'signup' && (
              <>
                <div className="login-field">
                  <label className="login-label">Full Name</label>
                  <input className="input-glass" type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required={tab === 'signup'} />
                </div>
                <div className="login-field">
                  <label className="login-label">Username</label>
                  <input className="input-glass" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required={tab === 'signup'} />
                </div>
              </>
            )}
            <div className="login-field">
              <label className="login-label">{tab === 'signup' ? 'Email Address' : 'Email or username'}</label>
              <input
                className="input-glass"
                type={tab === 'signup' ? 'email' : 'text'}
                placeholder={tab === 'signup' ? "you@example.com" : "you@example.com or username"}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
              />
            </div>
            
            {tab !== 'forgot' && (
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
                  <a href="#" className="login-forgot" onClick={(e) => { e.preventDefault(); setTab('forgot') }}>Forgot password?</a>
                )}
              </div>
            )}

            {error && <div className="login-error">{error}</div>}
            {/* Using inline style for success to match minimal design immediately */}
            {success && <div className="login-error" style={{ background: '#05966933', color: '#34d399', border: '1px solid #05966955' }}>{success}</div>}

            <button type="submit" className="btn-primary login-submit" disabled={isLoading}>
              {isLoading ? 'Loading…' : tab === 'signin' ? 'Sign In' : tab === 'forgot' ? 'Send Reset Link' : 'Create Account'}
            </button>
            
            {tab === 'forgot' && (
              <button type="button" className="btn-glass login-submit" style={{ marginTop: '8px' }} onClick={() => setTab('signin')}>
                Back to Sign In
              </button>
            )}
          </form>

          <div className="login-divider"><span>or continue with</span></div>

          <div className="login-socials">
            {['G Google', ' Apple', 'f Facebook'].map(s => (
              <button key={s} className="btn-glass login-social-btn">{s}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
