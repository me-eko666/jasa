import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
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

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.nama || !form.no_wa || !form.layanan) return alert('Lengkapi nama, WhatsApp, dan layanan.')
    if (!address) return alert('Masukkan alamat atau pin lokasi di peta.')
    const p = await tambahPesanan({ nama:form.nama, no_wa:form.no_wa, layanan:form.layanan,
      alamat:address, catatan:form.catatan, lat:position?.lat||null, lng:position?.lng||null })
    setSubmitted(true)
    const wa = settings?.whatsapp || '6281234567890'
    const wn = wa.startsWith('0') ? '62'+wa.slice(1) : wa
    const msg = `*🌿 Pesanan Pijat Baru!*\n\n👤 Nama: ${form.nama}\n📱 WA: ${form.no_wa}\n💆 Layanan: ${form.layanan}\n📍 Alamat: ${address}\n📝 Catatan: ${form.catatan||'-'}\n🔖 ID: #${p.id}`
    setTimeout(() => window.open(`https://wa.me/${wn}?text=${encodeURIComponent(msg)}`, '_blank'), 400)
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
          ? `linear-gradient(rgba(250,250,248,0.80),rgba(250,250,248,0.92)),url(${settings.hero_image}) center/cover`
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
            textTransform:'uppercase', marginBottom:28,
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
                border:`1px solid rgba(154,123,47,0.10)`,
                boxShadow:'0 2px 16px rgba(154,123,47,0.07)',
                transition:'all 0.3s', cursor:'default',
              }}>
                {s.gambar
                  ? <img src={s.gambar} alt={s.nama} style={{ width:'100%', height:140, objectFit:'cover', borderRadius:12, marginBottom:18 }}/>
                  : <div style={{
                      width:60, height:60, borderRadius:14, marginBottom:18,
                      background:BM, border:`1px solid rgba(154,123,47,0.16)`,
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
                    }}>{s.icon||'💆'}</div>
                }
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <h3 style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:T }}>{s.nama}</h3>
                  <span style={{
                    fontSize:11, fontWeight:700, color:pc,
                    background:BM, padding:'3px 10px', borderRadius:99,
                    border:`1px solid rgba(154,123,47,0.14)`,
                  }}>{s.durasi}</span>
                </div>
                {s.deskripsi && <p style={{ fontSize:13, color:M, lineHeight:1.65, marginBottom:16 }}>{s.deskripsi}</p>}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:14, borderTop:`1px solid rgba(154,123,47,0.10)` }}>
                  <span style={{ fontSize:17, fontWeight:800, color:pc, fontFamily:sans }}>{s.harga}</span>
                  <button onClick={() => goTo('sec-pesan','pesan')} style={{
                    padding:'7px 16px', borderRadius:99, fontSize:12, fontWeight:700,
                    background:`linear-gradient(135deg,${GL},${pc})`, color:W,
                    border:'none', cursor:'pointer', fontFamily:sans,
                    boxShadow:`0 2px 8px rgba(154,123,47,0.22)`,
                  }}>Pesan</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            <form onSubmit={handleSubmit} style={{
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
                <select value={form.layanan} onChange={e=>setForm({...form,layanan:e.target.value})} required
                  style={{ width:'100%', padding:'13px 16px', borderRadius:12, fontSize:14.5,
                    border:`1.5px solid rgba(154,123,47,0.18)`, background:BG, color:T,
                    cursor:'pointer', fontFamily:sans, transition:'all 0.18s' }}
                  onFocus={e=>{e.target.style.borderColor=pc; e.target.style.boxShadow=`0 0 0 3px rgba(154,123,47,0.10)`}}
                  onBlur={e=>{e.target.style.borderColor='rgba(154,123,47,0.18)'; e.target.style.boxShadow='none'}}
                >
                  <option value="">— Pilih layanan —</option>
                  {(settings.layanan||[]).map(s=>(
                    <option key={s.id} value={s.nama}>{s.nama} — {s.harga} ({s.durasi})</option>
                  ))}
                </select>
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

              <button type="submit" style={{
                width:'100%', padding:'16px', borderRadius:99, fontSize:16, fontWeight:800,
                background:`linear-gradient(135deg,${GL},${pc})`, color:W,
                border:'none', cursor:'pointer', letterSpacing:0.5,
                boxShadow:`0 6px 24px rgba(154,123,47,0.28)`, fontFamily:sans,
                transition:'all 0.2s',
              }}>Kirim Pesanan via WhatsApp 🚀</button>
            </form>
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background:'#18120A', padding:'48px 24px 32px', textAlign:'center' }}>
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
