// Utility untuk mengelola data JSON di localStorage

const DEFAULT_SETTINGS = {
  nama_usaha: "Pijat Prima",
  logo: "💆",
  tagline: "Sentuhan Terbaik untuk Kesehatanmu",
  deskripsi: "Layanan pijat profesional dengan terapis berpengalaman. Hadir di lokasi Anda untuk kenyamanan maksimal.",
  telepon: "08123456789",
  whatsapp: "6281234567890",
  alamat: "Jl. Sehat No. 1, Kota Rileks",
  jam_buka: "08:00 - 22:00",
  footer_text: "© 2024 Pijat Prima · Semua Hak Dilindungi",
  hero_image: "",
  warna_utama: "#b8860b",
  warna_sekunder: "#8B6914",
  admin_username: "echorockers06",
  admin_password: "11November",
  layanan: [
    { id: 1, nama: "Pijat Relaksasi", deskripsi: "Pijat lembut untuk merilekskan seluruh tubuh dan menghilangkan stres.", durasi: "60 menit", harga: "Rp 100.000", icon: "💆", gambar: "" },
    { id: 2, nama: "Pijat Refleksi", deskripsi: "Fokus pada titik-titik refleksi telapak kaki untuk kesehatan optimal.", durasi: "45 menit", harga: "Rp 80.000", icon: "🦶", gambar: "" },
    { id: 3, nama: "Pijat Shiatsu", deskripsi: "Teknik pijat Jepang dengan penekanan pada titik meridian tubuh.", durasi: "90 menit", harga: "Rp 150.000", icon: "🙌", gambar: "" },
    { id: 4, nama: "Pijat Sport", deskripsi: "Pijat khusus atlet untuk pemulihan otot pasca latihan atau pertandingan.", durasi: "60 menit", harga: "Rp 120.000", icon: "💪", gambar: "" },
  ],
  testimoni: [
    { nama: "Budi Santoso", avatar: "👨", bintang: 5, pesan: "Sangat memuaskan! Terapis sangat profesional dan badan jadi segar kembali." },
    { nama: "Siti Rahayu", avatar: "👩", bintang: 5, pesan: "Pijat refleksinya enak banget, tidur jadi lebih nyenyak setelahnya." },
    { nama: "Ahmad Fauzi", avatar: "🧑", bintang: 5, pesan: "Harga terjangkau, kualitas bintang lima. Highly recommended!" },
  ],
}

export const getSettings = () => {
  const data = localStorage.getItem('pijat_settings')
  if (data) {
    const parsed = JSON.parse(data)
    // Merge with defaults to ensure new fields exist
    return { ...DEFAULT_SETTINGS, ...parsed }
  }
  localStorage.setItem('pijat_settings', JSON.stringify(DEFAULT_SETTINGS))
  return DEFAULT_SETTINGS
}

export const saveSettings = (settings) => {
  localStorage.setItem('pijat_settings', JSON.stringify(settings))
}

export const getPesanan = () => {
  const data = localStorage.getItem('pijat_pesanan')
  if (data) return JSON.parse(data)
  return []
}

export const tambahPesanan = (pesanan) => {
  const list = getPesanan()
  const newItem = {
    ...pesanan,
    id: Date.now(),
    waktu: new Date().toLocaleString('id-ID'),
    status: 'Menunggu',
  }
  list.unshift(newItem)
  localStorage.setItem('pijat_pesanan', JSON.stringify(list))
  return newItem
}

export const updateStatusPesanan = (id, status) => {
  const list = getPesanan()
  const idx = list.findIndex(p => p.id === id)
  if (idx !== -1) {
    list[idx].status = status
    localStorage.setItem('pijat_pesanan', JSON.stringify(list))
  }
}

export const hapusPesanan = (id) => {
  const list = getPesanan().filter(p => p.id !== id)
  localStorage.setItem('pijat_pesanan', JSON.stringify(list))
}
