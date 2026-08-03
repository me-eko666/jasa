import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSettings } from '../utils/storage'

const G   = '#1877F2'   // Facebook blue - ONE color only
const GL  = '#1877F2'   // same, no gradient
const GD  = '#1464CC'   // dark variant for hover only
const T   = '#1C2B4A'
const M   = '#65748B'
const BG  = '#F0F4FF'
const BW  = '#E8F0FE'
const W   = '#FFFFFF'
const sans = "'Plus Jakarta Sans', sans-serif"
const serif = "'Lora', Georgia, serif"

export default function LoginAdmin({ setAuth }) {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    const s = await getSettings()
    if (form.username === (s.admin_username || 'admin') && form.password === (s.admin_password || 'admin123')) {
      sessionStorage.setItem('admin_login', 'true')
      if (setAuth) setAuth(true)
      navigate('/admin')
    } else {
      setError('Username atau password salah.')
      setLoading(false)
    }
  }

  const inpStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 14.5,
    border: `1.5px solid rgba(24,119,242,0.20)`, background: BG, color: T,
    fontFamily: sans, outline: 'none', transition: 'all 0.18s',
  }

  return (
    <div style={{
      minHeight: '100vh', background: BW, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: sans, position: 'relative', overflow: 'hidden', padding: '24px',
    }}>
      {/* Decorative rings */}
      {[600, 400, 220].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', width: s, height: s, borderRadius: '50%',
          border: `1px solid rgba(24,119,242,${0.05 + i * 0.04})`,
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none',
        }} />
      ))}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(66,147,245,0.10) 0%, transparent 65%)',
        top: '-100px', right: '-80px', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Card */}
        <div style={{
          background: W, borderRadius: 24, padding: '44px 40px',
          border: `1px solid rgba(24,119,242,0.12)`,
          boxShadow: '0 12px 48px rgba(24,119,242,0.10), 0 2px 8px rgba(24,119,242,0.06)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 18px',
              background: `linear-gradient(135deg, ${GL}, ${G})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, boxShadow: `0 6px 24px rgba(24,119,242,0.28)`,
            }}>🛡️</div>
            <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: T, marginBottom: 6 }}>
              Admin Panel
            </h2>
            <p style={{ fontSize: 13.5, color: M }}>Masuk untuk mengelola bisnis Anda</p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Username */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: G, marginBottom: 8, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                Username
              </label>
              <input
                type="text" placeholder="Masukkan username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                style={inpStyle}
                onFocus={e => { e.target.style.borderColor = G; e.target.style.boxShadow = '0 0 0 3px rgba(24,119,242,0.10)'; e.target.style.background = W }}
                onBlur={e => { e.target.style.borderColor = 'rgba(24,119,242,0.20)'; e.target.style.boxShadow = 'none'; e.target.style.background = BG }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: G, marginBottom: 8, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password" placeholder="Masukkan password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={inpStyle}
                onFocus={e => { e.target.style.borderColor = G; e.target.style.boxShadow = '0 0 0 3px rgba(24,119,242,0.10)'; e.target.style.background = W }}
                onBlur={e => { e.target.style.borderColor = 'rgba(24,119,242,0.20)'; e.target.style.boxShadow = 'none'; e.target.style.background = BG }}
              />
            </div>

            {error && (
              <div style={{
                padding: '11px 15px', marginBottom: 18, borderRadius: 12,
                background: 'rgba(220,53,69,0.06)', border: '1px solid rgba(220,53,69,0.20)',
                fontSize: 13.5, color: '#c0392b', display: 'flex', alignItems: 'center', gap: 8,
              }}>⚠️ {error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 99, fontSize: 15, fontWeight: 700,
              background: loading ? 'rgba(24,119,242,0.45)' : `linear-gradient(135deg, ${GL}, ${G})`,
              color: W, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: `0 4px 20px rgba(24,119,242,0.28)`, fontFamily: sans,
              transition: 'all 0.2s', letterSpacing: 0.3,
            }}>
              {loading ? '⏳ Memverifikasi...' : 'Masuk →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 22 }}>
            <a href="/" style={{ color: M, fontSize: 13, textDecoration: 'none' }}>← Kembali ke Beranda</a>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(24,119,242,0.35)' }}>
          Pijat Prima · Admin Portal
        </p>
      </div>
    </div>
  )
}
