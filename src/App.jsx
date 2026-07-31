import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import LoginAdmin from './pages/LoginAdmin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminHome from './pages/admin/AdminHome'
import AdminPesanan from './pages/admin/AdminPesanan'

function App() {
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    setIsAuth(sessionStorage.getItem('admin_login') === 'true')
  }, [])

  const Protected = ({ children }) =>
    isAuth ? children : <Navigate to="/admin/login" replace />

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<LoginAdmin setAuth={setIsAuth} />} />
        <Route
          path="/admin"
          element={
            <Protected>
              <AdminLayout setAuth={setIsAuth} />
            </Protected>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="pesanan" element={<AdminPesanan />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
