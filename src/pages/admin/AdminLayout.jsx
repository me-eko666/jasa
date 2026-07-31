import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import styles from './AdminLayout.module.css'

export default function AdminLayout({ setAuth }) {
  const navigate = useNavigate()

  function handleLogout() {
    sessionStorage.removeItem('admin_login')
    if (setAuth) setAuth(false)
    navigate('/admin/login')
  }

  return (
    <div className={styles.layout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sideHeader}>
          <span className={styles.sideLogo}>💆</span>
          <div>
            <p className={styles.sideName}>Pijat Admin</p>
            <p className={styles.sideRole}>Administrator</p>
          </div>
        </div>
        <nav className={styles.sideNav}>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span>⚙️</span> Dashboard & Pengaturan
          </NavLink>
          <NavLink
            to="/admin/pesanan"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span>📋</span> Kelola Pesanan
          </NavLink>
          <NavLink to="/" className={styles.navItem}>
            <span>🏠</span> Lihat Website
          </NavLink>
        </nav>
        <button className={styles.btnLogout} onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
