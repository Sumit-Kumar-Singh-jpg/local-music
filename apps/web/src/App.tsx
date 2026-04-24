import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useSyncStore } from './store/syncStore'

// Layouts
import AppShell from './components/layout/AppShell'
import AdminShell from './components/layout/AdminShell'

// Auth pages
import LoginPage from './pages/Login'

// User pages
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import Album from './pages/Album'
import Artist from './pages/Artist'
import Playlist from './pages/Playlist'
import NowPlaying from './pages/NowPlaying'
import Settings from './pages/Settings'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  return user?.role === 'ADMIN' ? <>{children}</> : <Navigate to="/" replace />
}

import Modal from './components/ui/Modal'
import React from 'react'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('🔴 React Error Boundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: '#0d0d0f', color: '#fff', fontFamily: 'Inter, sans-serif',
          gap: 16, padding: 32, textAlign: 'center'
        }}>
          <span style={{ fontSize: '3rem' }}>😵</span>
          <h2>Something went wrong</h2>
          <p style={{ color: '#888', maxWidth: 400 }}>{this.state.error?.message}</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#A855F7', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const initSync = useSyncStore(s => s.init)
  const destroySync = useSyncStore(s => s.destroy)

  useEffect(() => {
    initSync()
    return () => destroySync()
  }, [initSync, destroySync])

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Modal />
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminShell />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminDashboard />} />
          <Route path="content" element={<AdminDashboard />} />
          <Route path="tasks" element={<AdminDashboard />} />
        </Route>

        {/* Main App */}
        <Route path="/" element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="album/:id" element={<Album />} />
          <Route path="artist/:id" element={<Artist />} />
          <Route path="playlist/:id" element={<Playlist />} />
          <Route path="now-playing" element={<NowPlaying />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
