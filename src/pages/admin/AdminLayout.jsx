import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import styles from './AdminLayout.module.css'

const navLinks = [
  { to: '/admin',         end: true,  icon: '⚙️', label: 'Dashboard' },
  { to: '/admin/pesanan', end: false, icon: '📋', label: 'Kelola Pesanan' },
  { to: '/',              end: true,  icon: '🏠', label: 'Lihat Website' },
]

export default function AdminLayout({ setAuth }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const pageTitle =
    location.pathname === '/admin'              ? 'Dashboard' :
    location.pathname.startsWith('/admin/pesanan') ? 'Kelola Pesanan'        : ''

  const { businessName } = (() => {
    try {
      const s = JSON.parse(localStorage.getItem('pijat_settings_cache') || localStorage.getItem('pijat_settings') || '{}')
      return { businessName: s.nama_usaha || 'Pijat Admin' }
    } catch { return { businessName: 'Pijat Admin' } }
  })()

  function handleLogout() {
    sessionStorage.removeItem('admin_login')
    if (setAuth) setAuth(false)
    navigate('/admin/login')
  }

  const sidebarContent = (
    <>
      <div className={styles.sideHeader}>
        <span className={styles.sideLogo}>💆</span>
        <div>
          <p className={styles.sideName}>{businessName}</p>
          <p className={styles.sideRole}>Administrator</p>
        </div>
      </div>

      <nav className={styles.sideNav}>
        <div className={styles.navDivider}>Menu</div>
        {navLinks.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.sideBottom}>
        <button className={styles.btnLogout} onClick={handleLogout}>
          <span className={styles.navIcon}>🚪</span>
          Logout
        </button>
      </div>
    </>
  )

  return (
    <div className={styles.layout}>

      {/* ── Backdrop (mobile) ── */}
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        {sidebarContent}
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>

        {/* Mobile topbar */}
        <div className={styles.mobileBar}>
          <div className={styles.mobileBarBrand}>
            <div className={styles.mobileBarLogo}>💆</div>
            <span className={styles.mobileBarName}>{businessName}</span>
          </div>
          <button
            className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`}
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Desktop breadcrumb */}
        {pageTitle && (
          <div className={styles.topbar}>
            <span className={styles.topbarTitle}>Admin</span>
            <div className={styles.topbarDot} />
            <span className={styles.topbarPage}>{pageTitle}</span>
          </div>
        )}

        <Outlet />
      </main>

    </div>
  )
}
