import { useEffect, useState } from 'react'
import { adminApi } from '../../lib/api'
import './Dashboard.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { useModalStore } from '../../store/modalStore'

export default function AdminDashboard() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'tasks'>('overview')
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [content, setContent] = useState<any[]>([])
  const [ingestUrl, setIngestUrl] = useState('')
  const [ingesting, setIngesting] = useState(false)
  const { showConfirm, showAlert } = useModalStore()
  const navigate = useNavigate()

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ingestUrl) return
    setIngesting(true)
    try {
      await adminApi.addPlaylist(ingestUrl)
      showAlert('Success', 'Playlist ingestion has started!')
      setIngestUrl('')
      refresh()
    } catch (err: any) { showAlert('Error', err.message) }
    finally { setIngesting(false) }
  }

  // Sync tab with URL
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/users')) setActiveTab('users')
    else if (path.includes('/content')) setActiveTab('content')
    else if (path.includes('/tasks')) setActiveTab('tasks')
    else setActiveTab('overview')
  }, [location])

  // Fetch critical data
  const refresh = () => {
    Promise.all([
      adminApi.getStats().catch(() => ({ stats: null })),
      adminApi.getUsers(50).catch(() => ({ users: [] })),
      adminApi.getTasks().catch(() => ({ tasks: [] })),
      adminApi.getContent().catch(() => ({ tracks: [] })),
    ]).then(([statsRes, usersRes, tasksRes, contentRes]) => {
      setStats(statsRes.stats)
      setUsers(usersRes.users)
      setTasks(tasksRes.tasks)
      setContent(contentRes.tracks)
    })
  }

  // Polling for tasks
  useEffect(() => {
    refresh()
    const interval = setInterval(() => {
      adminApi.getTasks().then(res => setTasks(res.tasks)).catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveUser(id)
      showAlert('Success', 'User has been approved!')
      refresh()
    } catch (err: any) { showAlert('Error', err.message) }
  }

  const handleDeleteUser = async (id: string) => {
    showConfirm('Delete User', 'Permanently delete this user?', async () => {
      try {
        await adminApi.deleteUser(id)
        refresh()
      } catch (err: any) { showAlert('Error', err.message) }
    })
  }

  const handleStopTask = async (id: string) => {
    try {
      await adminApi.stopTask(id)
      adminApi.getTasks().then(res => setTasks(res.tasks))
    } catch (err: any) { showAlert('Error', err.message) }
  }

  const handleDeleteSong = async (id: string) => {
    showConfirm('Delete Song', 'Delete song and storage file?', async () => {
      try {
        await adminApi.deleteSong(id)
        refresh()
      } catch (err: any) { showAlert('Error', err.message) }
    })
  }

  const STAT_CARDS = stats ? [
    { label: 'Users', value: stats.totalUsers, icon: '👥', color: '#A855F7' },
    { label: 'Tracks', value: stats.totalTracks, icon: '🎵', color: '#EC4899' },
    { label: 'Artists', value: stats.totalArtists, icon: '🎤', color: '#10B981' },
    { label: 'Plays', value: stats.totalPlays, icon: '▶', color: '#3B82F6' },
  ] : []
  return (
    <div className="admin-dashboard fade-in">
      {/* ... header ... */}
      <div className="admin-header">
        <div>
          <h1>Control Center</h1>
          <p className="subtitle">High-performance management portal</p>
        </div>
        <div className="header-actions">
          <button className="btn-glass" onClick={refresh}>↻ Refresh</button>
        </div>
      </div>

      <div className="admin-content-area">
        {/* ... stats ... */}
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <div className="admin-stats-grid">
              {STAT_CARDS.map(s => (
                <div key={s.label} className="admin-stat-card glass-high">
                  <div className="admin-stat-icon-wrap" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-label">{s.label}</span>
                    <div className="admin-stat-value">{s.value?.toLocaleString() || '0'}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-section glass">
              <h2>⚡ Quick Actions</h2>
              <div className="quick-actions-list">
                <button className="btn-action" onClick={() => navigate('/admin/users')}>Review {users.filter(u => !u.isApproved).length} Pending Users</button>
                <button className="btn-action" onClick={() => navigate('/admin/tasks')}>View {tasks.filter(t => t.status === 'RUNNING').length} Active Jobs</button>
              </div>
            </div>
          </div>
        )}

        {/* ... users ... */}
        {activeTab === 'users' && (
          <div className="tab-pane glass">
            <h2>User Directory</h2>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>User</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><div className="user-info"><span className="user-name">{u.name}</span><span className="user-email">{u.email}</span></div></td>
                      <td><span className={`status-pill ${u.isApproved ? 'active' : 'pending'}`}>{u.isApproved ? 'Approved' : 'Pending'}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="actions">
                        {!u.isApproved && <button className="btn-approve" onClick={() => handleApprove(u.id)}>Approve</button>}
                        <button className="btn-delete" onClick={() => handleDeleteUser(u.id)}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ... content ... */}
        {activeTab === 'content' && (
          <div className="tab-pane glass">
            <h2>Music Library</h2>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Track</th><th>Artist / Album</th><th>Storage</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {content.map(t => (
                    <tr key={t.id}>
                      <td><div className="user-info"><span className="user-name">{t.title}</span><span className="user-email">ID: {t.id}</span></div></td>
                      <td><div className="user-info"><span className="user-name">{t.artist?.name}</span><span className="user-email">{t.album?.title || 'Single'}</span></div></td>
                      <td><span className="badge-mini">{t.storage?.storageType || 'NONE'}</span></td>
                      <td className="actions">
                        <button className="btn-delete" onClick={() => handleDeleteSong(t.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ... TASKS (Updated) ... */}
        {activeTab === 'tasks' && (
          <div className="tab-pane">
            <div className="admin-section glass ingestion-top-tool">
              <h2>🚀 Batch Music Ingestion</h2>
              <p className="dimmed">Add a Spotify Playlist or Track URL to seed your local library</p>
              <form className="ingestion-form-standalone" onSubmit={handleIngest}>
                <input 
                  type="text" 
                  placeholder="https://open.spotify.com/playlist/..." 
                  value={ingestUrl}
                  onChange={e => setIngestUrl(e.target.value)}
                />
                <button type="submit" disabled={ingesting}>
                  {ingesting ? '⏳ Processing...' : 'Start Ingestion'}
                </button>
              </form>
            </div>

            <div className="admin-section glass">
              <h2>📡 Active & Past Tasks</h2>
              <div className="tasks-list">
                {tasks.length === 0 && <p className="dimmed">No ingestion tasks found.</p>}
                {tasks.map(t => (
                  <div key={t.id} className="task-card">
                    <div className="task-info">
                      <div className="task-meta">
                        <span className={`task-status ${t.status.toLowerCase()}`}>{t.status}</span>
                        <span className="task-url">{t.url}</span>
                      </div>
                      <span className="task-time">{new Date(t.createdAt).toLocaleString()}</span>
                    </div>
                    
                    {t.status === 'RUNNING' && (
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${t.progress}%` }}></div>
                        </div>
                        <div className="progress-stats">
                          <span>{t.completedTracks} / {t.totalTracks} tracks</span>
                          <span>{t.progress}%</span>
                        </div>
                        <button className="btn-stop" onClick={() => handleStopTask(t.id)}>Stop Process</button>
                      </div>
                    )}
                    {t.error && <p className="task-error">Error: {t.error}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
