import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import Select from 'react-select'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getSettings, tambahPesanan } from '../utils/storage'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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

// ── X/Twitter embed component ──────────────────────────────
function XEmbed({ url }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = ''
    const anchor = document.createElement('a')
    anchor.className = 'twitter-video'
    anchor.href = url
    ref.current.appendChild(anchor)
    if (window.twttr?.widgets) {
      window.twttr.widgets.load(ref.current)
    } else {
      const s = document.createElement('script')
      s.src = 'https://platform.twitter.com/widgets.js'
      s.async = true
      s.onload = () => window.twttr?.widgets?.load(ref.current)
      document.head.appendChild(s)
    }
  }, [url])
  return (
    <div ref={ref} style={{ background:'#000', minHeight:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'12px' }}>
      <span style={{ color:'#555', fontSize:13 }}>Memuat video X...</span>
    </div>
  )
}

// ── TikTok embed component ─────────────────────────────────
function TikTokEmbed({ url }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = `
      <blockquote class="tiktok-embed"
        cite="${url}"
        data-video-id="${url.match(/\/video\/(\d+)/)?.[1]||''}"
        style="max-width:100%;min-width:280px;border:none;">
      </blockquote>`
    if (window.TikTok) {
      // already loaded
      window.TikTok.reload?.()
    } else {
      const s = document.createElement('script')
      s.src = 'https://www.tiktok.com/embed.js'
      s.async = true
      document.body.appendChild(s)
    }
  }, [url])
  return (
    <div ref={ref} style={{ background:'#000', minHeight:400, display:'flex', alignItems:'center', justifyContent:'center', padding:'8px', overflowX:'hidden' }}>
      <span style={{ color:'#555', fontSize:13 }}>Memuat video TikTok...</span>
    </div>
  )
}

const G  = '#1877F2'   // Facebook blue solid
const GL = '#1877F2'   // same - no gradient
const GD = '#1464CC'   // darker for hover
const T  = '#1C2B4A'   // text
const M  = '#65748B'   // muted
const W  = '#FFFFFF'   // white
const BG = '#F0F4FF'   // bg
const BW = '#E8F0FE'   // warm bg
const BM = '#DCE8FD'   // mid bg
const BD = `1px solid rgba(24,119,242,0.13)` // border

const serif = "'Lora', Georgia, serif"
const sans  = "'Plus Jakarta Sans', sans-serif"

export default function HomePage() {
  const [settings, setSettings] = useState(null)
  const [form, setForm]         = useState({ nama:'', no_wa:'', layanan:'', catatan:'' })
  const [position, setPosition] = useState(null)
  const [address, setAddress]   = useState('')
  const [mapCenter]             = useState([-6.2, 106.816])
  const [submitted, setSubmitted] = useState(false)
  const [locating, setLocating]   = useState(false)
  const [activeNav, setActiveNav] = useState('beranda')
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => { getSettings().then(s => setSettings(s)) }, [])

  const pc  = G  // always solid Facebook blue - ignore saved color setting
  const pc2 = G  // same, no two-tone

  const goTo = (id, nav) => {
    setActiveNav(nav)
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const getGPS = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const ll = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(ll)
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${ll.lat}&lon=${ll.lng}&format=json`)
          .then(r => r.json()).then(d => setAddress(d.display_name || ''))
          .catch(() => setAddress(`${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}`))
          .finally(() => setLocating(false))
      },
      () => { alert('Izin lokasi ditolak.'); setLocating(false) }
    )
  }

  const buildMsg = (p) =>
    `*🌿 Pesanan Pijat Baru!*\n\n👤 Nama: ${form.nama}\n📱 WA: ${form.no_wa}\n💆 Layanan: ${form.layanan}\n📍 Alamat: ${address}\n📝 Catatan: ${form.catatan||'-'}\n🔖 ID: #${p.id}`

  const handleSubmit = async (via) => {
    if (!form.nama || !form.no_wa || !form.layanan) return alert('Lengkapi nama, WhatsApp, dan layanan.')
    if (!address) return alert('Masukkan alamat atau pin lokasi di peta.')
    const p = await tambahPesanan({ nama:form.nama, no_wa:form.no_wa, layanan:form.layanan,
      alamat:address, catatan:form.catatan, lat:position?.lat||null, lng:position?.lng||null })
    setSubmitted(true)
    const msg = buildMsg(p)
    if (via === 'wa') {
      const wa = settings?.whatsapp || '6281234567890'
      const wn = wa.startsWith('0') ? '62'+wa.slice(1) : wa
      setTimeout(() => window.open(`https://wa.me/${wn}?text=${encodeURIComponent(msg)}`, '_blank'), 400)
    } else {
      const tg = settings?.telegram || ''
      if (!tg) return alert('Admin belum mengatur username Telegram.')
      const tgUser = tg.replace('@','')
      setTimeout(() => window.open(`https://t.me/${tgUser}?text=${encodeURIComponent(msg)}`, '_blank'), 400)
    }
  }

  if (!settings) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:`3px solid ${GL}`, borderTopColor:'transparent',
        animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const navs = [
    { key:'beranda',   label:'Beranda',   id:'sec-hero' },
    { key:'layanan',   label:'Layanan',   id:'sec-layanan' },
    { key:'testimoni', label:'Testimoni', id:'sec-testi' },
    { key:'pesan',     label:'Pesan',     id:'sec-pesan' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:BG, color:T, fontFamily:sans }}>

      {/* ─── GLOBAL STYLES ─── */}
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .hp-hero-content { animation: fadeUp 0.7s ease both; }
        .hp-card:hover { transform:translateY(-6px)!important; box-shadow:0 20px 48px rgba(154,123,47,0.13)!important; }
        @media(max-width:640px){
          .hp-nav-links { display:none!important; }
          .hp-burger    { display:flex!important; }
        }
        @media(min-width:641px){
          .hp-mobile-menu { display:none!important; }
          .hp-burger       { display:none!important; }
        }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:300,
        height:64, display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 32px',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter:'blur(20px) saturate(180%)',
        WebkitBackdropFilter:'blur(20px) saturate(180%)',
        borderBottom: BD,
        boxShadow:'0 1px 0 rgba(154,123,47,0.08)',
      }}>
        {/* Brand */}
        <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => goTo('sec-hero','beranda')}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:`linear-gradient(135deg, ${GL}, ${pc})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:18, flexShrink:0,
            boxShadow:`0 2px 10px rgba(154,123,47,0.25)`,
          }}>{settings.logo||'💆'}</div>
          <span style={{ fontFamily:serif, fontWeight:700, fontSize:17, color:T, letterSpacing:0.2 }}>
            {settings.nama_usaha}
          </span>
        </div>

        {/* Desktop links */}
        <div className="hp-nav-links" style={{ display:'flex', alignItems:'center', gap:2 }}>
          {navs.map(n => (
            <button key={n.key} onClick={() => goTo(n.id, n.key)} style={{
              padding:'8px 18px', borderRadius:99, fontSize:13.5, fontWeight:600,
              transition:'all 0.2s', cursor:'pointer', fontFamily:sans,
              background: activeNav===n.key ? `linear-gradient(135deg,${GL},${pc})` : 'transparent',
              color: activeNav===n.key ? W : M,
              boxShadow: activeNav===n.key ? `0 2px 12px rgba(154,123,47,0.22)` : 'none',
              border:'none',
            }}>{n.label}</button>
          ))}
          <div style={{ width:1, height:20, background:BD, margin:'0 8px' }} />
          <a href={`https://wa.me/${settings.whatsapp?.startsWith('0')?'62'+settings.whatsapp.slice(1):settings.whatsapp}`}
            target="_blank" rel="noreferrer" style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'8px 18px', borderRadius:99,
              background:`linear-gradient(135deg,${GL},${pc})`,
              color:W, fontSize:13.5, fontWeight:700,
              boxShadow:`0 2px 12px rgba(154,123,47,0.22)`,
              textDecoration:'none', whiteSpace:'nowrap',
            }}>💬 WA</a>
        </div>

        {/* Burger */}
        <button className="hp-burger" onClick={() => setMenuOpen(o=>!o)} style={{
          width:40, height:40, borderRadius:10, display:'none',
          flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5,
          background: menuOpen ? `linear-gradient(135deg,${GL},${pc})` : BM,
          border: BD, cursor:'pointer', flexShrink:0,
        }}>
          {[0,1,2].map(i=>(
            <span key={i} style={{
              display:'block', width:18, height:2, borderRadius:2, transition:'all 0.25s',
              background: menuOpen?W:pc,
              transform: menuOpen?(i===0?'translateY(7px) rotate(45deg)':i===2?'translateY(-7px) rotate(-45deg)':'none'):'none',
              opacity: menuOpen&&i===1?0:1,
            }}/>
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className="hp-mobile-menu" style={{
        position:'fixed', top:64, left:0, right:0, zIndex:299,
        background:'rgba(255,255,255,0.97)', backdropFilter:'blur(16px)',
        borderBottom: BD, overflow:'hidden',
        maxHeight: menuOpen?'280px':'0',
        transition:'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: menuOpen?'0 8px 24px rgba(154,123,47,0.08)':'none',
      }}>
        <div style={{ padding:'12px 20px 20px', display:'flex', flexDirection:'column', gap:6 }}>
          {navs.map(n=>(
            <button key={n.key} onClick={() => goTo(n.id,n.key)} style={{
              padding:'12px 18px', borderRadius:12, textAlign:'left', width:'100%',
              background: activeNav===n.key?BM:'transparent',
              border: activeNav===n.key?BD:'1px solid transparent',
              color: activeNav===n.key?pc:M,
              fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:sans,
            }}>{n.label}</button>
          ))}
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section id="sec-hero" style={{
        minHeight:'100vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        paddingTop:64, paddingBottom:60, paddingLeft:24, paddingRight:24,
        position:'relative', overflow:'hidden',
        background: settings.hero_image
          ? `linear-gradient(rgba(250,250,248,0.30),rgba(250,250,248,0.92)),url(${settings.hero_image}) center/cover`
          : `linear-gradient(165deg, #FDF8EF 0%, #FAFAF8 50%, #F4EFE4 100%)`,
      }}>
        {/* Decorative rings */}
        {[700,500,320].map((s,i)=>(
          <div key={i} style={{
            position:'absolute', width:s, height:s, borderRadius:'50%',
            border:`1px solid rgba(154,123,47,${0.06+i*0.03})`,
            top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none',
          }}/>
        ))}
        {/* Soft blob */}
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%',
          background:`radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)`,
          top:'-150px', right:'-150px', pointerEvents:'none' }}/>

        <div className="hp-hero-content" style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          {/* Badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'7px 18px', borderRadius:99,
            background:BM, border:BD,
            fontSize:12, fontWeight:700, color:pc, letterSpacing:1,
            textTransform:'uppercase', marginBottom:28, marginTop:20,
          }}>✦ Home Service Profesional</div>

          {/* Icon */}
          <div style={{
            width:100, height:100, borderRadius:'50%',
            background:`linear-gradient(135deg, ${GL}, ${pc})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:46, marginBottom:28,
            boxShadow:`0 8px 40px rgba(154,123,47,0.24)`,
            animation:'float 4s ease-in-out infinite',
          }}>{settings.logo||'💆'}</div>

          <h1 style={{
            fontFamily:serif, fontSize:'clamp(2.4rem,6vw,4.2rem)',
            fontWeight:700, color:T, textAlign:'center',
            lineHeight:1.15, marginBottom:14, letterSpacing:-0.5,
          }}>{settings.nama_usaha}</h1>

          <p style={{
            fontFamily:serif, fontStyle:'italic',
            fontSize:'clamp(1rem,2.2vw,1.2rem)', color:pc,
            textAlign:'center', maxWidth:480, marginBottom:14,
          }}>{settings.tagline}</p>

          <p style={{
            fontSize:14.5, color:M, textAlign:'center',
            maxWidth:440, marginBottom:40, lineHeight:1.8,
          }}>{settings.deskripsi}</p>

          {/* CTA */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginBottom:52 }}>
            <button onClick={() => goTo('sec-pesan','pesan')} style={{
              padding:'14px 36px', borderRadius:99, fontSize:15, fontWeight:700,
              background:`linear-gradient(135deg, ${GL}, ${pc})`,
              color:W, border:'none', cursor:'pointer',
              boxShadow:`0 6px 24px rgba(154,123,47,0.30)`,
              letterSpacing:0.3, transition:'all 0.2s', fontFamily:sans,
            }}>Pesan Sekarang →</button>
            <a href={`https://wa.me/${settings.whatsapp?.startsWith('0')?'62'+settings.whatsapp.slice(1):settings.whatsapp}`}
              target="_blank" rel="noreferrer" style={{
                padding:'13px 32px', borderRadius:99, fontSize:15, fontWeight:700,
                background:W, color:pc,
                border:`1.5px solid rgba(154,123,47,0.30)`,
                display:'flex', alignItems:'center', gap:8,
                textDecoration:'none', fontFamily:sans,
                boxShadow:'0 2px 12px rgba(154,123,47,0.10)',
              }}>💬 WhatsApp</a>
          </div>

          {/* Info strip */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
            {[
              { icon:'⏰', label:'Jam Buka',  val:settings.jam_buka },
              { icon:'📍', label:'Area',      val:'Home Service' },
              { icon:'⭐', label:'Rating',    val:'5.0 / 5.0' },
              { icon:'📞', label:'Telepon',   val:settings.telepon },
            ].map(c=>(
              <div key={c.label} style={{
                background:W, border:BD, borderStyle:'solid', borderWidth:1,
                borderRadius:16, padding:'12px 18px',
                display:'flex', alignItems:'center', gap:10,
                boxShadow:'0 2px 12px rgba(154,123,47,0.06)',
              }}>
                <span style={{ fontSize:20 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize:10.5, color:M, letterSpacing:0.5, textTransform:'uppercase', marginBottom:2 }}>{c.label}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:T }}>{c.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div style={{ height:2, background:`linear-gradient(90deg, transparent, ${GL}, ${pc}, ${GL}, transparent)`, opacity:0.2 }}/>

      {/* ─── LAYANAN ─── */}
      <section id="sec-layanan" style={{ padding:'96px 24px', background:BM }}>
        <div style={{ maxWidth:1040, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, fontWeight:700, color:pc, letterSpacing:4, textTransform:'uppercase', marginBottom:10 }}>Layanan Kami</div>
            <h2 style={{ fontFamily:serif, fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:700, color:T, marginBottom:14 }}>
              Pilihan Pijat Premium
            </h2>
            <div style={{ width:48, height:2, background:`linear-gradient(90deg,${GL},${pc})`, margin:'0 auto', borderRadius:99 }}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:22 }}>
            {(settings.layanan||[]).map((s,i)=>(
              <div key={s.id||i} className="hp-card" style={{
                background:W, borderRadius:20, padding:'26px 22px',
                border:`1px solid rgba(24,119,242,0.10)`,
                boxShadow:'0 2px 16px rgba(24,119,242,0.07)',
                transition:'all 0.3s', cursor:'default',
              }}>
                {s.gambar
                  ? <img src={s.gambar} alt={s.nama} style={{ width:'100%', height:140, objectFit:'cover', borderRadius:12, marginBottom:18 }}/>
                  : <div style={{
                      width:60, height:60, borderRadius:14, marginBottom:18,
                      background:BW, border:`1px solid rgba(24,119,242,0.12)`,
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
                    }}>{s.icon||'💆'}</div>
                }
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <h3 style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:T }}>{s.nama}</h3>
                  <span style={{
                    fontSize:11, fontWeight:700, color:pc,
                    background:BW, padding:'3px 10px', borderRadius:99,
                    border:`1px solid rgba(24,119,242,0.14)`,
                  }}>{s.durasi}</span>
                </div>
                {s.deskripsi && <p style={{ fontSize:13, color:M, lineHeight:1.65, marginBottom:16 }}>{s.deskripsi}</p>}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:14, borderTop:`1px solid rgba(24,119,242,0.08)` }}>
                  <span style={{ fontSize:17, fontWeight:800, color:pc, fontFamily:sans }}>{s.harga}</span>
                  <button onClick={() => goTo('sec-pesan','pesan')} style={{
                    padding:'7px 16px', borderRadius:99, fontSize:12, fontWeight:700,
                    background:pc, color:W,
                    border:'none', cursor:'pointer', fontFamily:sans,
                    boxShadow:`0 2px 8px rgba(24,119,242,0.22)`,
                  }}>Pesan</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VIDEO SECTION ─── */}
      {(settings.layanan||[]).some(s => s.video) && (
        <section id="sec-video" style={{ padding:'96px 24px', background:W }}>
          <div style={{ maxWidth:1040, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:52 }}>
              <div style={{ fontSize:11, fontWeight:700, color:pc, letterSpacing:4, textTransform:'uppercase', marginBottom:10 }}>Video Layanan</div>
              <h2 style={{ fontFamily:serif, fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:700, color:T, marginBottom:14 }}>
                Lihat Cara Kerja Kami
              </h2>
              <div style={{ width:48, height:2, background:pc, margin:'0 auto', borderRadius:99 }}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:28 }}>
              {(settings.layanan||[]).filter(s=>s.video).map((s,i) => {
                const url = s.video || ''

                // Detect YouTube
                const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
                const ytId = ytMatch?.[1]

                // Detect X/Twitter tweet
                const isX = /(?:twitter\.com|x\.com)\/.+\/status\/(\d+)/.test(url)

                // Detect TikTok
                const isTikTok = /tiktok\.com\/.+\/video\/\d+/.test(url)

                return (
                  <div key={s.id||i} style={{
                    background:BG, borderRadius:20, overflow:'hidden',
                    border:`1px solid rgba(24,119,242,0.10)`,
                    boxShadow:'0 4px 20px rgba(24,119,242,0.08)',
                  }}>
                    {/* ── YouTube embed ── */}
                    {ytId && (
                      <div style={{ position:'relative', paddingBottom:'56.25%', height:0, overflow:'hidden' }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                          title={s.nama} frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
                        />
                      </div>
                    )}

                    {/* ── X/Twitter embed ── */}
                    {isX && (
                      <XEmbed url={url} />
                    )}

                    {/* ── TikTok embed ── */}
                    {isTikTok && (
                      <TikTokEmbed url={url} />
                    )}

                    {/* Caption */}
                    <div style={{ padding:'18px 20px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                        <span style={{
                          width:38, height:38, borderRadius:10, flexShrink:0,
                          background:BW, border:`1px solid rgba(24,119,242,0.12)`,
                          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                        }}>{s.icon||'💆'}</span>
                        <div>
                          <div style={{ fontWeight:700, color:T, fontSize:15, fontFamily:serif }}>{s.nama}</div>
                          <div style={{ fontSize:12, color:M }}>{s.durasi} · <span style={{ color:pc, fontWeight:700 }}>{s.harga}</span></div>
                        </div>
                      </div>
                      <button onClick={() => goTo('sec-pesan','pesan')} style={{
                        width:'100%', padding:'10px', borderRadius:99, fontSize:13, fontWeight:700,
                        background:pc, color:W, border:'none', cursor:'pointer',
                        boxShadow:`0 2px 10px rgba(24,119,242,0.22)`, fontFamily:sans,
                      }}>Pesan Layanan Ini</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── TESTIMONI ─── */}
      {settings.testimoni?.length > 0 && (
        <section id="sec-testi" style={{ padding:'96px 24px', background:W }}>
          <div style={{ maxWidth:940, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:52 }}>
              <div style={{ fontSize:11, fontWeight:700, color:pc, letterSpacing:4, textTransform:'uppercase', marginBottom:10 }}>Ulasan Pelanggan</div>
              <h2 style={{ fontFamily:serif, fontSize:'clamp(2rem,4vw,2.6rem)', fontWeight:700, color:T, marginBottom:14 }}>
                Apa Kata Mereka
              </h2>
              <div style={{ width:48, height:2, background:`linear-gradient(90deg,${GL},${pc})`, margin:'0 auto', borderRadius:99 }}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))', gap:20 }}>
              {settings.testimoni.map((t,i)=>(
                <div key={i} style={{
                  background:BG, borderRadius:20, padding:'26px 24px',
                  border:`1px solid rgba(154,123,47,0.10)`,
                  boxShadow:'0 2px 14px rgba(154,123,47,0.06)',
                }}>
                  <div style={{ fontSize:40, color:GL, lineHeight:1, marginBottom:12, opacity:0.6, fontFamily:'Georgia,serif' }}>"</div>
                  <p style={{ fontFamily:serif, fontStyle:'italic', fontSize:14, color:M, lineHeight:1.75, marginBottom:20 }}>{t.pesan}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:16, borderTop:`1px solid rgba(154,123,47,0.08)` }}>
                    <div style={{
                      width:44, height:44, borderRadius:'50%',
                      background:BM, border:`1px solid rgba(154,123,47,0.16)`,
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0,
                    }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight:700, color:T, fontSize:14, marginBottom:2 }}>{t.nama}</div>
                      <div style={{ fontSize:12, color:GL }}>{'⭐'.repeat(t.bintang)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FORM PESAN ─── */}
      <section id="sec-pesan" style={{ padding:'96px 24px', background:BW }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:700, color:pc, letterSpacing:4, textTransform:'uppercase', marginBottom:10 }}>Booking Online</div>
            <h2 style={{ fontFamily:serif, fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:700, color:T, marginBottom:10 }}>
              Pesan Sekarang
            </h2>
            <p style={{ color:M, fontSize:14.5, lineHeight:1.7 }}>Isi form & bagikan lokasi — admin hubungi via WhatsApp</p>
            <div style={{ width:48, height:2, background:`linear-gradient(90deg,${GL},${pc})`, margin:'14px auto 0', borderRadius:99 }}/>
          </div>

          {submitted ? (
            <div style={{ textAlign:'center', background:W, border:BD, borderStyle:'solid', borderWidth:1,
              borderRadius:24, padding:'56px 36px', boxShadow:'0 6px 32px rgba(154,123,47,0.10)' }}>
              <div style={{ fontSize:64, marginBottom:18 }}>✅</div>
              <h3 style={{ fontFamily:serif, fontSize:24, fontWeight:700, color:pc, marginBottom:10 }}>Pesanan Terkirim!</h3>
              <p style={{ color:M, marginBottom:28, lineHeight:1.7 }}>
                Terima kasih <strong style={{ color:T }}>{form.nama}</strong>!<br/>
                Admin akan menghubungi Anda segera via WhatsApp.
              </p>
              <button onClick={()=>{ setSubmitted(false); setForm({nama:'',no_wa:'',layanan:'',catatan:''}); setPosition(null); setAddress('') }}
                style={{
                  padding:'13px 32px', borderRadius:99, fontSize:15, fontWeight:700,
                  background:`linear-gradient(135deg,${GL},${pc})`, color:W, border:'none', cursor:'pointer',
                  boxShadow:`0 4px 18px rgba(154,123,47,0.26)`, fontFamily:sans,
                }}>Pesan Lagi</button>
            </div>
          ) : (
            <form onSubmit={e => e.preventDefault()} style={{
              background:W, borderRadius:24, padding:'36px 32px',
              border:`1px solid rgba(154,123,47,0.12)`,
              boxShadow:'0 8px 40px rgba(154,123,47,0.09)',
            }}>
              {[
                { id:'nama',  label:'Nama Lengkap *',  type:'text',  ph:'Masukkan nama Anda' },
                { id:'no_wa', label:'No. WhatsApp *',   type:'tel',   ph:'08123456789' },
              ].map(f=>(
                <div key={f.id} style={{ marginBottom:20 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:pc, marginBottom:7, letterSpacing:0.3, textTransform:'uppercase' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={form[f.id]}
                    onChange={e=>setForm({...form,[f.id]:e.target.value})} required
                    style={{ width:'100%', padding:'13px 16px', borderRadius:12, fontSize:14.5,
                      border:`1.5px solid rgba(154,123,47,0.18)`, background:BG, color:T,
                      transition:'all 0.18s', fontFamily:sans }}
                    onFocus={e=>{e.target.style.borderColor=pc; e.target.style.boxShadow=`0 0 0 3px rgba(154,123,47,0.10)`; e.target.style.background=W}}
                    onBlur={e=>{e.target.style.borderColor='rgba(154,123,47,0.18)'; e.target.style.boxShadow='none'; e.target.style.background=BG}}
                  />
                </div>
              ))}

              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:pc, marginBottom:7, letterSpacing:0.3, textTransform:'uppercase' }}>Pilih Layanan *</label>
                <Select
                  placeholder="🔍 Cari atau pilih layanan..."
                  noOptionsMessage={() => 'Layanan tidak ditemukan'}
                  isClearable
                  options={(settings.layanan||[]).map(s=>({
                    value: s.nama,
                    label: `${s.icon||'💆'} ${s.nama} — ${s.harga} (${s.durasi})`,
                  }))}
                  value={form.layanan ? {
                    value: form.layanan,
                    label: (() => { const s=(settings.layanan||[]).find(x=>x.nama===form.layanan); return s?`${s.icon||'💆'} ${s.nama} — ${s.harga} (${s.durasi})`:form.layanan })()
                  } : null}
                  onChange={opt => setForm({...form, layanan: opt ? opt.value : ''})}
                  styles={{
                    control: (base, state) => ({
                      ...base, borderRadius:12, padding:'3px 4px', fontSize:14.5, fontFamily:sans,
                      borderColor: state.isFocused ? pc : 'rgba(24,119,242,0.18)',
                      boxShadow: state.isFocused ? `0 0 0 3px rgba(24,119,242,0.10)` : 'none',
                      background: state.isFocused ? '#fff' : BG,
                      '&:hover':{ borderColor: pc },
                    }),
                    option: (base, state) => ({
                      ...base, fontSize:14, fontFamily:sans, cursor:'pointer', borderRadius:8, margin:'2px 0',
                      background: state.isSelected ? pc : state.isFocused ? BM : '#fff',
                      color: state.isSelected ? '#fff' : T,
                    }),
                    menu: base => ({ ...base, borderRadius:14, border:`1px solid rgba(24,119,242,0.15)`, boxShadow:'0 8px 24px rgba(24,119,242,0.13)', overflow:'hidden' }),
                    menuList: base => ({ ...base, padding:6 }),
                    placeholder: base => ({ ...base, color:'#9EB3D8', fontSize:14.5, fontFamily:sans }),
                    singleValue: base => ({ ...base, color:T, fontFamily:sans }),
                    input: base => ({ ...base, fontFamily:sans }),
                    clearIndicator: base => ({ ...base, color:'#aab', cursor:'pointer', '&:hover':{ color:'#E53935' } }),
                    dropdownIndicator: base => ({ ...base, color:pc }),
                    indicatorSeparator: base => ({ ...base, background:'rgba(24,119,242,0.15)' }),
                  }}
                />
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:pc, marginBottom:7, letterSpacing:0.3, textTransform:'uppercase' }}>Lokasi Anda *</label>
                <button type="button" onClick={getGPS} disabled={locating} style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  padding:'10px 22px', borderRadius:99, fontSize:13.5, fontWeight:700,
                  background:`linear-gradient(135deg,${GL},${pc})`, color:W,
                  border:'none', cursor:locating?'not-allowed':'pointer', marginBottom:12,
                  opacity:locating?0.7:1, boxShadow:`0 2px 12px rgba(154,123,47,0.24)`, fontFamily:sans,
                }}>{locating?'⏳ Mencari...':'📍 Gunakan GPS'}</button>
                <p style={{ fontSize:12, color:M, marginBottom:10 }}>Atau klik peta untuk pin lokasi</p>
                <div style={{ borderRadius:14, overflow:'hidden', border:`1.5px solid rgba(154,123,47,0.18)`, height:280 }}>
                  <MapContainer center={position?[position.lat,position.lng]:mapCenter} zoom={13}
                    style={{ height:'100%', width:'100%' }} key={position?`${position.lat},${position.lng}`:'d'}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM'/>
                    <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress}/>
                  </MapContainer>
                </div>
                {address && (
                  <div style={{ marginTop:10, padding:'10px 14px', background:BM,
                    border:`1px solid rgba(154,123,47,0.18)`, borderRadius:10,
                    fontSize:13, color:M, lineHeight:1.5 }}>
                    📍 {address}
                  </div>
                )}
                <input type="text" placeholder="Atau ketik alamat manual" value={address}
                  onChange={e=>setAddress(e.target.value)}
                  style={{ width:'100%', padding:'13px 16px', borderRadius:12, fontSize:14.5,
                    border:`1.5px solid rgba(154,123,47,0.18)`, background:BG, color:T,
                    marginTop:10, fontFamily:sans, transition:'all 0.18s' }}
                  onFocus={e=>{e.target.style.borderColor=pc; e.target.style.boxShadow=`0 0 0 3px rgba(154,123,47,0.10)`; e.target.style.background=W}}
                  onBlur={e=>{e.target.style.borderColor='rgba(154,123,47,0.18)'; e.target.style.boxShadow='none'; e.target.style.background=BG}}
                />
              </div>

              <div style={{ marginBottom:28 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:pc, marginBottom:7, letterSpacing:0.3, textTransform:'uppercase' }}>Catatan (opsional)</label>
                <textarea placeholder="Permintaan khusus, kondisi badan, dll." value={form.catatan}
                  onChange={e=>setForm({...form,catatan:e.target.value})} rows={3}
                  style={{ width:'100%', padding:'13px 16px', borderRadius:12, fontSize:14.5,
                    border:`1.5px solid rgba(154,123,47,0.18)`, background:BG, color:T,
                    resize:'vertical', fontFamily:sans, transition:'all 0.18s' }}
                  onFocus={e=>{e.target.style.borderColor=pc; e.target.style.boxShadow=`0 0 0 3px rgba(154,123,47,0.10)`; e.target.style.background=W}}
                  onBlur={e=>{e.target.style.borderColor='rgba(154,123,47,0.18)'; e.target.style.boxShadow='none'; e.target.style.background=BG}}
                />
              </div>

              {/* Send buttons */}
              <div style={{ display:'flex', gap:10, flexDirection:'column' }}>
                <div style={{ fontSize:11, fontWeight:700, color:G, letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>
                  Kirim pesanan via:
                </div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <button type="button" onClick={() => handleSubmit('wa')} style={{
                    flex:1, minWidth:140, padding:'15px 20px', borderRadius:99, fontSize:15, fontWeight:800,
                    background:'#25D366', color:'#fff', border:'none', cursor:'pointer',
                    boxShadow:'0 6px 20px rgba(37,211,102,0.32)', fontFamily:sans,
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='none'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp
                  </button>
                  {settings?.telegram && (
                    <button type="button" onClick={() => handleSubmit('telegram')} style={{
                      flex:1, minWidth:140, padding:'15px 20px', borderRadius:99, fontSize:15, fontWeight:800,
                      background:'#229ED9', color:'#fff', border:'none', cursor:'pointer',
                      boxShadow:'0 6px 20px rgba(34,158,217,0.32)', fontFamily:sans,
                      display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s',
                    }}
                      onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='none'}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                      Telegram
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background:'rgb(27, 39, 31)', padding:'48px 24px 32px', textAlign:'center' }}>
        <div style={{
          width:52, height:52, borderRadius:'50%', margin:'0 auto 14px',
          background:`linear-gradient(135deg,${GL},${pc})`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
          boxShadow:`0 4px 16px rgba(201,168,76,0.28)`,
        }}>{settings.logo||'💆'}</div>
        <div style={{ fontFamily:serif, fontWeight:700, fontSize:18, color:'#F5EDD4', marginBottom:8 }}>{settings.nama_usaha}</div>
        <p style={{ color:'rgba(245,237,212,0.5)', fontSize:13, marginBottom:6 }}>{settings.alamat}</p>
        <p style={{ color:'rgba(245,237,212,0.35)', fontSize:12, marginBottom:20 }}>{settings.footer_text}</p>
        <a href="/admin/login" style={{ fontSize:12, color:'rgba(245,237,212,0.25)',
          textDecoration:'none', padding:'4px 14px',
          border:'1px solid rgba(245,237,212,0.12)', borderRadius:99 }}>
          ⚙ Admin
        </a>
      </footer>

    </div>
  )
}
