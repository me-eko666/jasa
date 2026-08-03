// ─── Firebase Realtime Database REST API ───────────────────
const DB = 'https://jasa-jakarta-default-rtdb.firebaseio.com'

// ─── DEFAULT DATA ───────────────────────────────────────────
const DEFAULT_SETTINGS = {
  nama_usaha:   'Pijat Prima',
  logo:         '💆',
  tagline:      'Sentuhan Terbaik untuk Kesehatanmu',
  deskripsi:    'Layanan pijat profesional dengan terapis berpengalaman. Hadir di lokasi Anda untuk kenyamanan maksimal.',
  telepon:      '08123456789',
  whatsapp:     '6281234567890',
  alamat:       'Jl. Sehat No. 1, Jakarta',
  jam_buka:     '08:00 - 22:00',
  footer_text:  '© 2025 Pijat Prima · Semua Hak Dilindungi',
  hero_image:   '',
  warna_utama:  '#1877F2',
  warna_sekunder: '#1877F2',
  admin_username: 'echorockers06',
  admin_password: '11November',
  layanan: [
    { id: 1, nama: 'Pijat Relaksasi',  deskripsi: 'Pijat lembut untuk merilekskan seluruh tubuh dan menghilangkan stres.',          durasi: '60 menit', harga: 'Rp 100.000', icon: '💆', gambar: '' },
    { id: 2, nama: 'Pijat Refleksi',   deskripsi: 'Fokus pada titik-titik refleksi telapak kaki untuk kesehatan optimal.',           durasi: '45 menit', harga: 'Rp 80.000',  icon: '🦶', gambar: '' },
    { id: 3, nama: 'Pijat Shiatsu',    deskripsi: 'Teknik pijat Jepang dengan penekanan pada titik meridian tubuh.',                 durasi: '90 menit', harga: 'Rp 150.000', icon: '🙌', gambar: '' },
    { id: 4, nama: 'Pijat Sport',      deskripsi: 'Pijat khusus atlet untuk pemulihan otot pasca latihan atau pertandingan.',        durasi: '60 menit', harga: 'Rp 120.000', icon: '💪', gambar: '' },
  ],
  testimoni: [
    { nama: 'Budi Santoso', avatar: '👨', bintang: 5, pesan: 'Sangat memuaskan! Terapis sangat profesional dan badan jadi segar kembali.' },
    { nama: 'Siti Rahayu',  avatar: '👩', bintang: 5, pesan: 'Pijat refleksinya enak banget, tidur jadi lebih nyenyak setelahnya.' },
    { nama: 'Ahmad Fauzi',  avatar: '🧑', bintang: 5, pesan: 'Harga terjangkau, kualitas bintang lima. Highly recommended!' },
  ],
}

// ════════════════════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════════════════════

/** Ambil settings — selalu dari Firebase, fallback ke localStorage */
export const getSettings = async () => {
  try {
    const res = await fetch(`${DB}/settings.json`)
    if (!res.ok) throw new Error('fetch failed')
    const data = await res.json()
    if (data) {
      // cache lokal buat offline fallback
      localStorage.setItem('pijat_settings_cache', JSON.stringify(data))
      return { ...DEFAULT_SETTINGS, ...data }
    }
    // Belum ada di DB → inisialisasi dengan default
    await saveSettings(DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  } catch {
    // Offline → pakai cache
    const cache = localStorage.getItem('pijat_settings_cache')
    return cache ? { ...DEFAULT_SETTINGS, ...JSON.parse(cache) } : DEFAULT_SETTINGS
  }
}

/** Simpan settings ke Firebase + update cache lokal */
export const saveSettings = async (settings) => {
  localStorage.setItem('pijat_settings_cache', JSON.stringify(settings))
  await fetch(`${DB}/settings.json`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(settings),
  })
}

// ════════════════════════════════════════════════════════════
//  PESANAN
// ════════════════════════════════════════════════════════════

/** Ambil semua pesanan dari Firebase */
export const getPesanan = async () => {
  try {
    const res = await fetch(`${DB}/pesanan.json`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    if (!data) return []
    // Firebase returns object with keys, convert to array sorted newest first
    return Object.values(data).sort((a, b) => b.id - a.id)
  } catch {
    return []
  }
}

/** Tambah pesanan baru */
export const tambahPesanan = async (pesanan) => {
  const newItem = {
    ...pesanan,
    id:     Date.now(),
    waktu:  new Date().toLocaleString('id-ID'),
    status: 'Menunggu',
  }
  await fetch(`${DB}/pesanan/${newItem.id}.json`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(newItem),
  })
  return newItem
}

/** Update status pesanan */
export const updateStatusPesanan = async (id, status) => {
  await fetch(`${DB}/pesanan/${id}/status.json`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(status),
  })
}

/** Hapus pesanan */
export const hapusPesanan = async (id) => {
  await fetch(`${DB}/pesanan/${id}.json`, { method: 'DELETE' })
}
