import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSettings } from '../utils/storage'

const gold = '#b8860b'
const darkGold = '#8B6914'

export default function LoginAdmin({ setAuth }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    setTimeout(() => {
      const settings = getSettings()
      if (
        form.username === (settings.admin_username || 'admin') &&
        form.password === (settings.admin_password || 'admin123')
      ) {
        sessionStorage.setItem('admin_login', 'true')
        if (setAuth) setAuth(true)
        navigate('/admin')
      } else {
        setError('Username atau password salah!')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0d0300 0%, #1a0a00 50%, #0d0300 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', border:`1px solid ${gold}15`, top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', border:`1px solid ${gold}25`, top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', border:`1px solid ${gold}35`, top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, padding:'0 24px', position:'relative', zIndex:1 }}>
        <div style={{
          background:'rgba(255,255,255,0.03)',
          border:`1px solid ${gold}33`,
          borderRadius:28, padding:'48px 40px',
          backdropFilter:'blur(20px)',
          boxShadow:`0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 ${gold}22`,
        }}>
          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <div style={{
              width:80, height:80, borderRadius:'50%',
              background:`linear-gradient(135deg, ${gold}, ${darkGold})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:36, margin:'0 auto 18px',
              boxShadow:`0 0 40px ${gold}66, 0 0 80px ${gold}22`,
            }}>🛡️</div>
            <h2 style={{
              fontSize:26, fontWeight:800,
              background:`linear-gradient(90deg, #FFD700, ${gold}, #FFD700)`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              marginBottom:6, letterSpacing:1,
            }}>Admin Panel</h2>
            <p style={{ fontSize:13, color:'#555' }}>Masuk untuk mengelola bisnis Anda</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:11, color:gold, marginBottom:8, fontWeight:700, letterSpacing:2, textTransform:'uppercase' }}>
                Username
              </label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                style={{
                  width:'100%', padding:'14px 16px',
                  background:'rgba(255,255,255,0.06)',
                  border:`1px solid ${gold}33`,
                  borderRadius:14, color:'#fff',
                  fontSize:15, outline:'none',
                  transition:'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = gold}
                onBlur={e => e.target.style.borderColor = `${gold}33`}
              />
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:11, color:gold, marginBottom:8, fontWeight:700, letterSpacing:2, textTransform:'uppercase' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                style={{
                  width:'100%', padding:'14px 16px',
                  background:'rgba(255,255,255,0.06)',
                  border:`1px solid ${gold}33`,
                  borderRadius:14, color:'#fff',
                  fontSize:15, outline:'none',
                  transition:'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = gold}
                onBlur={e => e.target.style.borderColor = `${gold}33`}
              />
            </div>

            {error && (
              <div style={{
                padding:'12px 16px', marginBottom:18,
                background:'rgba(255,59,48,0.1)', border:'1px solid rgba(255,59,48,0.3)',
                borderRadius:12, fontSize:13, color:'#ff6b6b',
                display:'flex', alignItems:'center', gap:8,
              }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'15px',
              background:`linear-gradient(135deg, ${gold}, ${darkGold})`,
              border:'none', color:'#fff', borderRadius:14,
              fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
              boxShadow:`0 4px 24px ${gold}55`,
              letterSpacing:1, transition:'all 0.2s',
            }}>
              {loading ? '⏳ Memverifikasi...' : '🔓 Masuk'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:24 }}>
            <a href="/" style={{ color:'#444', fontSize:13, textDecoration:'none', transition:'color 0.2s' }}>
              ← Kembali ke Beranda
            </a>
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:16, fontSize:12, color:'#333' }}>
          &nbsp;
        </p>
      </div>
    </div>
  )
}
