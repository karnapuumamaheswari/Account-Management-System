import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout">
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-tag">Account Management System</span>
            <span className="brand-title">Secure Transfers</span>
          </div>
          <nav className="nav-links">
            <NavLink
              className={({ isActive }) =>
                `nav-link${isActive ? ' active' : ''}`
              }
              to="/dashboard"
            >
              Dashboard
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `nav-link${isActive ? ' active' : ''}`
              }
              to="/send-money"
            >
              Send Money
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `nav-link${isActive ? ' active' : ''}`
              }
              to="/statement"
            >
              Statement
            </NavLink>
          </nav>
          <div className="topbar-actions">
            <span className="welcome-chip">{user?.name}</span>
            <button className="button-secondary" type="button" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </header>

        <main className="content-grid">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
