import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import NowPlayingBar from '../player/NowPlaying'


export default function AppShell() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div className="app-layout" style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <TopBar />
          <main className="main-content fade-in" style={{ 
            paddingBottom: 'calc(var(--player-height) + var(--space-4))'
          }}>
            <Outlet />
          </main>
        </div>
      </div>
      <NowPlayingBar />
    </div>
  )
}
