import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import NowPlayingBar from '../player/NowPlaying'
import { useState, useEffect } from 'react'

export default function AppShell() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div className="app-layout" style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {!isMobile && <Sidebar />}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <TopBar />
          <main className="main-content fade-in" style={{ 
            paddingBottom: isMobile ? 'calc(var(--player-height) + 80px)' : 'var(--space-8)'
          }}>
            <Outlet />
          </main>
        </div>
      </div>
      <NowPlayingBar />
      {isMobile && <BottomNav />}
    </div>
  )
}
