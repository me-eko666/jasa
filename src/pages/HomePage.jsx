import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getSettings, tambahPesanan } from '../utils/storage'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function LocationMarker({ position, setPosition, setAddress }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`)
        .then(r => r.json())
        .then(d => setAddress(d.display_name || ''))
        .catch(() => setAddress(`${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`))
    },
  })
  return position ? <Marker position={position} /> : null
}

export default function HomePage() {
  const [settings, setSettings] = useState(null)
  const [form, setForm] = useState({ nama: '', no_wa: '', layanan: '', catatan: '' })
  const [position, setPosition] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [address, setAddress] = useState('')
  const [mapCenter] = useState([-6.2, 106.816])
  const [submitted, setSubmitted] = useState(false)
  const [locating, setLocating] = useState(false)
  const [activeNav, setActiveNav] = useState('beranda')

  useEffect(() => { setSettings(getSettings()) }, [])

  const pc = settings?.warna_utama || '#b8860b'
  const pc2 = settings?.warna_sekunder || '#8B6914'

  const scrollTo = (id, nav) => {
    setActiveNav(nav)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const getCurrentLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(latlng)
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`)
          .then(r => r.json())
          .then(d => setAddress(d.display_name || `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`))
          .catch(() => setAddress(`${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`))
          .finally(() => setLocating(false))
      },
      () => {
        alert('Tidak bisa mendapat lokasi. Pastikan izin lokasi diaktifkan.')
        setLocating(false)
      }
    )
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.nama || !form.no_wa || !form.layanan) {
      alert('Mohon isi nama, no. WhatsApp, dan pilih layanan.')
      return
    }
    if (!address) {
      alert('Mohon masukkan alamat atau bagikan lokasi Anda.')
      return
    }
    const pesanan = tambahPesanan({
      nama: form.nama,
      no_wa: form.no_wa,
      layanan: form.layanan,
      alamat: address,
      catatan: form.catatan,
      lat: position?.lat || null,
      lng: position?.lng || null,
    })
    setSubmitted(true)
    const wa = settings?.whatsapp || '6281234567890'
    const waNum = wa.startsWith('0') ? '62' + wa.slice(1) : wa
    const msg = `*🌿 Pesanan Pijat Baru!*\n\n👤 Nama: ${form.nama}\n📱 WA: ${form.no_wa}\n💆 Layanan: ${form.layanan}\n📍 Alamat: ${address}\n📝 Catatan: ${form.catatan || '-'}\n\n🔖 ID: #${pesanan.id}`
    setTimeout(() => window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank'), 400)
  }

  if (!settings) return (
    <div style={{ minHeight: '100vh', background: '#0f0600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#b8860b', fontSize: '1.5rem' }}>⏳ Memuat...</div>
    </div>
  )

  const navBtns = [
    { key: 'beranda', label: 'Beranda', id: 'sec-beranda' },
    { key: 'layanan', label: 'Layanan', id: 'sec-layanan' },
    { key: 'testimoni', label: 'Testimoni', id: 'sec-testimoni' },
    { key: 'pesan', label: 'Pesan', id: 'sec-pesan' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0f0600', color: '#fff', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(10,4,0,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${pc}22`,
        height: 66, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: `linear-gradient(135deg, ${pc}, ${pc2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: `0 0 18px ${pc}55`, flexShrink: 0,
          }}>{settings.logo || '💆'}</div>
          <span style={{
            fontWeight: 800, fontSize: 18, letterSpacing: 0.5,
            background: `linear-gradient(90deg, #FFD700, ${pc})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap',
          }}>{settings.nama_usaha}</span>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: 6, '@media(max-width:640px)': { display: 'none' } }} className="nav-desktop">
          {navBtns.map(n => (
            <button key={n.key} onClick={() => { scrollTo(n.id, n.key); setMobileMenuOpen(false) }} style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
              background: activeNav === n.key ? `linear-gradient(135deg, ${pc}, ${pc2})` : 'transparent',
              border: `1px solid ${activeNav === n.key ? pc : pc + '28'}`,
              color: activeNav === n.key ? '#fff' : '#888',
              boxShadow: activeNav === n.key ? `0 0 12px ${pc}44` : 'none',
              whiteSpace: 'nowrap',
            }}>{n.label}</button>
          ))}
        </div>

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMobileMenuOpen(o => !o)}
          className="nav-hamburger"
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: mobileMenuOpen ? `linear-gradient(135deg, ${pc}, ${pc2})` : `rgba(184,134,11,0.1)`,
            border: `1px solid ${pc}33`,
            display: 'none', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 5,
            cursor: 'pointer', flexShrink: 0,
          }}
          aria-label="Toggle menu"
        >
          <span style={{
            display: 'block', width: 18, height: 2,
            background: mobileMenuOpen ? '#fff' : pc, borderRadius: 2,
            transform: mobileMenuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
            transition: 'all 0.25s',
          }} />
          <span style={{
            display: 'block', width: 18, height: 2,
            background: mobileMenuOpen ? '#fff' : pc, borderRadius: 2,
            opacity: mobileMenuOpen ? 0 : 1,
            transition: 'all 0.25s',
          }} />
          <span style={{
            display: 'block', width: 18, height: 2,
            background: mobileMenuOpen ? '#fff' : pc, borderRadius: 2,
            transform: mobileMenuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
            transition: 'all 0.25s',
          }} />
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      <div style={{
        position: 'fixed', top: 66, left: 0, right: 0, zIndex: 199,
        background: 'rgba(10,4,0,0.98)',
        borderBottom: `1px solid ${pc}22`,
        backdropFilter: 'blur(16px)',
        padding: mobileMenuOpen ? '16px 20px 20px' : '0 20px',
        maxHeight: mobileMenuOpen ? '300px' : '0',
        overflow: 'hidden',
        transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', gap: 8,
      }} className="nav-mobile-dropdown">
        {navBtns.map(n => (
          <button key={n.key} onClick={() => { scrollTo(n.id, n.key); setMobileMenuOpen(false) }} style={{
            padding: '13px 18px', borderRadius: 12, fontSize: 15, fontWeight: 600,
            cursor: 'pointer', textAlign: 'left',
            background: activeNav === n.key ? `linear-gradient(135deg, ${pc}33, ${pc2}22)` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${activeNav === n.key ? pc + '55' : pc + '18'}`,
            color: activeNav === n.key ? '#FFD700' : '#aaa',
            width: '100%',
          }}>{n.label}</button>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 641px) {
          .nav-mobile-dropdown { display: none !important; }
          .nav-hamburger { display: none !important; }
        }
      `}</style>

      {/* ===== HERO ===== */}
      <section id="sec-beranda" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', paddingTop: 66,
        background: settings.hero_image
          ? `linear-gradient(rgba(10,4,0,0.75), rgba(15,6,0,0.88)), url(${settings.hero_image}) center/cover`
          : `radial-gradient(ellipse at 50% 40%, #2d1200 0%, #1a0800 40%, #0f0600 100%)`,
      }}>
        {/* Glow orbs */}
        <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:`radial-gradient(circle, ${pc}08 0%, transparent 70%)`, top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', border:`1px solid ${pc}18`, top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', border:`1px solid ${pc}0e`, top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />

        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: `linear-gradient(135deg, ${pc}, ${pc2})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 56, marginBottom: 28,
          boxShadow: `0 0 60px ${pc}66, 0 0 120px ${pc}22`,
          animation: 'pulse 3s ease-in-out infinite',
        }}>{settings.logo || '💆'}</div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', fontWeight: 900,
          background: `linear-gradient(135deg, #FFD700 0%, ${pc} 50%, #FFD700 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textAlign: 'center', lineHeight: 1.15, marginBottom: 18,
          padding: '0 24px', letterSpacing: 1,
        }}>{settings.nama_usaha}</h1>

        <p style={{
          fontSize: 'clamp(1rem, 2.2vw, 1.35rem)', color: '#d4af7a',
          textAlign: 'center', maxWidth: 520, fontStyle: 'italic',
          marginBottom: 16, padding: '0 24px',
        }}>{settings.tagline}</p>

        <p style={{
          fontSize: 14, color: '#888', textAlign: 'center', maxWidth: 480,
          padding: '0 24px', marginBottom: 40, lineHeight: 1.8,
        }}>{settings.deskripsi}</p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', padding: '0 24px', marginBottom: 50 }}>
          <button onClick={() => scrollTo('sec-pesan', 'pesan')} style={{
            background: `linear-gradient(135deg, ${pc}, ${pc2})`,
            border: 'none', color: '#fff', padding: '15px 36px',
            borderRadius: 30, fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 6px 28px ${pc}66`, letterSpacing: 1,
            transition: 'all 0.2s',
          }}>✨ Pesan Sekarang</button>
          <a href={`https://wa.me/${settings.whatsapp?.startsWith('0') ? '62' + settings.whatsapp.slice(1) : settings.whatsapp}`}
            target="_blank" rel="noreferrer" style={{
              border: `2px solid ${pc}`, color: pc, padding: '13px 30px',
              borderRadius: 30, fontSize: 16, fontWeight: 700,
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
            }}>💬 WhatsApp</a>
        </div>

        {/* Info strip */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', padding: '0 24px' }}>
          {[
            { icon: '⏰', label: 'Jam Buka', val: settings.jam_buka },
            { icon: '📍', label: 'Area', val: 'Home Service' },
            { icon: '⭐', label: 'Rating', val: '5.0 / 5.0' },
            { icon: '📞', label: 'Telepon', val: settings.telepon },
          ].map(c => (
            <div key={c.label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${pc}28`,
              borderRadius: 16, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ fontSize: 24 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: '#777', marginBottom: 3, letterSpacing: 0.5 }}>{c.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{c.val}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== LAYANAN ===== */}
      <section id="sec-layanan" style={{ padding: '90px 24px', background: '#0c0400' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: pc, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Layanan Kami</div>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800,
              background: `linear-gradient(90deg, #FFD700, ${pc})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Pilihan Pijat Premium</h2>
            <div style={{ width: 60, height: 3, background: `linear-gradient(90deg, ${pc}, transparent)`, margin: '16px auto 0' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {(settings.layanan || []).map((s, i) => (
              <div key={s.id || i} style={{
                background: `linear-gradient(160deg, rgba(184,134,11,0.1) 0%, rgba(139,105,20,0.04) 100%)`,
                border: `1px solid ${pc}28`,
                borderRadius: 22, padding: '28px 24px',
                transition: 'all 0.3s', cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.boxShadow = `0 20px 50px ${pc}28`
                  e.currentTarget.style.borderColor = `${pc}66`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = `${pc}28`
                }}
              >
                {s.gambar ? (
                  <img src={s.gambar} alt={s.nama} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, marginBottom: 18 }} />
                ) : (
                  <div style={{
                    fontSize: 46, marginBottom: 18,
                    width: 72, height: 72,
                    background: `linear-gradient(135deg, ${pc}28, ${pc2}15)`,
                    borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${pc}33`,
                  }}>{s.icon || '💆'}</div>
                )}
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{s.nama}</h3>
                {s.deskripsi && <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>{s.deskripsi}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#777' }}>⏱ {s.durasi}</span>
                  <span style={{
                    fontSize: 17, fontWeight: 800,
                    background: `linear-gradient(90deg, #FFD700, ${pc})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>{s.harga}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONI ===== */}
      {settings.testimoni && settings.testimoni.length > 0 && (
        <section id="sec-testimoni" style={{ padding: '90px 24px', background: `linear-gradient(180deg, #0c0400 0%, #0f0600 100%)` }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: pc, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Ulasan Pelanggan</div>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800,
                background: `linear-gradient(90deg, #FFD700, ${pc})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Apa Kata Mereka</h2>
              <div style={{ width: 60, height: 3, background: `linear-gradient(90deg, ${pc}, transparent)`, margin: '16px auto 0' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
              {settings.testimoni.map((t, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${pc}22`,
                  borderRadius: 20, padding: '28px 24px',
                  position: 'relative',
                }}>
                  <div style={{ fontSize: 48, color: pc, lineHeight: 1, marginBottom: 12, opacity: 0.4 }}>"</div>
                  <p style={{ fontSize: 14, color: '#ccc', lineHeight: 1.8, fontStyle: 'italic', marginBottom: 20 }}>
                    {t.pesan}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${pc}28, ${pc2}15)`,
                      border: `1px solid ${pc}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, flexShrink: 0,
                    }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{t.nama}</div>
                      <div style={{ fontSize: 13 }}>{'⭐'.repeat(t.bintang)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FORM PESAN ===== */}
      <section id="sec-pesan" style={{ padding: '90px 24px', background: '#0a0300' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: pc, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Booking Online</div>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800,
              background: `linear-gradient(90deg, #FFD700, ${pc})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Pesan Sekarang</h2>
            <p style={{ color: '#777', marginTop: 10, fontSize: 14 }}>Isi form & bagikan lokasi Anda — admin akan menghubungi via WhatsApp</p>
            <div style={{ width: 60, height: 3, background: `linear-gradient(90deg, ${pc}, transparent)`, margin: '16px auto 0' }} />
          </div>

          {submitted ? (
            <div style={{
              textAlign: 'center',
              background: `linear-gradient(160deg, rgba(184,134,11,0.12), rgba(139,105,20,0.06))`,
              border: `1px solid ${pc}55`, borderRadius: 24, padding: '56px 36px',
            }}>
              <div style={{ fontSize: 70, marginBottom: 20 }}>✅</div>
              <h3 style={{ fontSize: 26, fontWeight: 800, color: '#FFD700', marginBottom: 10 }}>Pesanan Terkirim!</h3>
              <p style={{ color: '#aaa', marginBottom: 28, lineHeight: 1.7 }}>
                Terima kasih <strong style={{ color: '#fff' }}>{form.nama}</strong>!<br />
                Admin akan segera menghubungi Anda via WhatsApp.
              </p>
              <button onClick={() => {
                setSubmitted(false)
                setForm({ nama: '', no_wa: '', layanan: '', catatan: '' })
                setPosition(null)
                setAddress('')
              }} style={{
                background: `linear-gradient(135deg, ${pc}, ${pc2})`,
                border: 'none', color: '#fff', padding: '13px 32px',
                borderRadius: 24, cursor: 'pointer', fontSize: 15, fontWeight: 700,
                boxShadow: `0 4px 20px ${pc}44`,
              }}>Pesan Lagi</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              background: 'rgba(255,255,255,0.025)',
              border: `1px solid ${pc}28`, borderRadius: 24, padding: '36px',
              boxShadow: `0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 ${pc}15`,
            }}>
              {/* Nama */}
              <div style={{ marginBottom: 22 }}>
                <label style={lbl(pc)}>👤 Nama Lengkap *</label>
                <input type="text" placeholder="Masukkan nama Anda" value={form.nama}
                  onChange={e => setForm({...form, nama: e.target.value})} style={inp(pc)} required
                  onFocus={e => e.target.style.borderColor = pc}
                  onBlur={e => e.target.style.borderColor = `${pc}33`}
                />
              </div>
              {/* No WA */}
              <div style={{ marginBottom: 22 }}>
                <label style={lbl(pc)}>📱 No. WhatsApp *</label>
                <input type="tel" placeholder="Contoh: 08123456789" value={form.no_wa}
                  onChange={e => setForm({...form, no_wa: e.target.value})} style={inp(pc)} required
                  onFocus={e => e.target.style.borderColor = pc}
                  onBlur={e => e.target.style.borderColor = `${pc}33`}
                />
              </div>
              {/* Layanan */}
              <div style={{ marginBottom: 22 }}>
                <label style={lbl(pc)}>💆 Pilih Layanan *</label>
                <select value={form.layanan} onChange={e => setForm({...form, layanan: e.target.value})}
                  style={{...inp(pc), cursor: 'pointer'}} required
                  onFocus={e => e.target.style.borderColor = pc}
                  onBlur={e => e.target.style.borderColor = `${pc}33`}
                >
                  <option value="">-- Pilih layanan --</option>
                  {(settings.layanan || []).map(s => (
                    <option key={s.id} value={s.nama}>{s.nama} – {s.harga} ({s.durasi})</option>
                  ))}
                </select>
              </div>

              {/* Lokasi */}
              <div style={{ marginBottom: 22 }}>
                <label style={lbl(pc)}>📍 Lokasi Anda *</label>
                <button type="button" onClick={getCurrentLocation} disabled={locating} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: `linear-gradient(135deg, ${pc}, ${pc2})`,
                  border: 'none', color: '#fff', padding: '11px 22px',
                  borderRadius: 20, cursor: locating ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 600, marginBottom: 14,
                  opacity: locating ? 0.7 : 1, boxShadow: `0 2px 14px ${pc}44`,
                }}>
                  {locating ? '📡 Mencari lokasi...' : '📍 Gunakan Lokasi Saya (GPS)'}
                </button>
                <p style={{ fontSize: 12, color: '#555', marginBottom: 10 }}>Atau klik langsung pada peta untuk menentukan lokasi</p>
                <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${pc}28`, height: 290 }}>
                  <MapContainer center={position ? [position.lat, position.lng] : mapCenter} zoom={13}
                    style={{ height: '100%', width: '100%' }} key={position ? `${position.lat},${position.lng}` : 'default'}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                    <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
                  </MapContainer>
                </div>
                {address && (
                  <div style={{
                    marginTop: 10, padding: '10px 16px',
                    background: `${pc}10`, border: `1px solid ${pc}28`,
                    borderRadius: 10, fontSize: 13, color: '#ccc', lineHeight: 1.5,
                  }}>📍 {address}</div>
                )}
                <input type="text" placeholder="Atau ketik alamat manual di sini"
                  value={address} onChange={e => setAddress(e.target.value)}
                  style={{...inp(pc), marginTop: 10}}
                  onFocus={e => e.target.style.borderColor = pc}
                  onBlur={e => e.target.style.borderColor = `${pc}33`}
                />
              </div>
              {/* Catatan */}
              <div style={{ marginBottom: 28 }}>
                <label style={lbl(pc)}>📝 Catatan (opsional)</label>
                <textarea placeholder="Catatan tambahan, permintaan khusus, dll."
                  value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})}
                  rows={3} style={{...inp(pc), resize: 'vertical'}}
                  onFocus={e => e.target.style.borderColor = pc}
                  onBlur={e => e.target.style.borderColor = `${pc}33`}
                />
              </div>
              <button type="submit" style={{
                width: '100%', padding: '17px',
                background: `linear-gradient(135deg, ${pc}, ${pc2})`,
                border: 'none', color: '#fff', borderRadius: 20,
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
                boxShadow: `0 6px 30px ${pc}55`, letterSpacing: 1,
                transition: 'all 0.2s',
              }}>
                🚀 Kirim Pesanan via WhatsApp
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        background: '#070200', padding: '36px 24px',
        borderTop: `1px solid ${pc}18`, textAlign: 'center',
      }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>{settings.logo || '💆'}</div>
        <div style={{
          fontWeight: 700, fontSize: 16, marginBottom: 8,
          background: `linear-gradient(90deg, #FFD700, ${pc})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>{settings.nama_usaha}</div>
        <p style={{ color: '#555', fontSize: 13, marginBottom: 8 }}>{settings.alamat}</p>
        <p style={{ color: '#444', fontSize: 12, marginBottom: 16 }}>{settings.footer_text}</p>
        <a href="/admin/login" style={{
          color: '#333', fontSize: 12, textDecoration: 'none',
          padding: '4px 12px', border: '1px solid #222', borderRadius: 20,
        }}>⚙ Admin</a>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 60px ${pc}66, 0 0 120px ${pc}22; }
          50% { box-shadow: 0 0 80px ${pc}99, 0 0 160px ${pc}33; }
        }
        option { background: #1a0800; color: #fff; }
      `}</style>
    </div>
  )
}

const lbl = (pc) => ({
  display: 'block', fontSize: 13, color: pc,
  marginBottom: 8, fontWeight: 700, letterSpacing: 0.5,
})

const inp = (pc) => ({
  width: '100%', padding: '13px 16px',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${pc}33`,
  borderRadius: 12, color: '#fff',
  fontSize: 14, outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
})
