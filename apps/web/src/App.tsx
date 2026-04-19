import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

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
  return user?.role === 'admin' ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  useAuthStore.getState().initDemoUser()

  return (
    <BrowserRouter>
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
  )
}
