import { useState, useEffect } from 'react'
import { getPesanan, updateStatusPesanan, hapusPesanan } from '../../utils/storage'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import styles from './AdminPesanan.module.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function AdminPesanan() {
  const [pesanan, setPesanan] = useState([])
  const [filter, setFilter] = useState('Semua')
  const [detail, setDetail] = useState(null)

  useEffect(() => { loadPesanan() }, [])

  function loadPesanan() { setPesanan(getPesanan()) }

  function handleChangeStatus(id, status) {
    updateStatusPesanan(id, status)
    loadPesanan()
    if (detail && detail.id === id) setDetail(prev => ({ ...prev, status }))
  }

  function handleHapus(id) {
    if (!confirm('Hapus pesanan ini?')) return
    hapusPesanan(id)
    loadPesanan()
    if (detail && detail.id === id) setDetail(null)
  }

  const filtered = filter === 'Semua' ? pesanan : pesanan.filter(p => p.status === filter)

  const stats = {
    total: pesanan.length,
    menunggu: pesanan.filter(p => p.status === 'Menunggu').length,
    dikonfirmasi: pesanan.filter(p => p.status === 'Dikonfirmasi').length,
    selesai: pesanan.filter(p => p.status === 'Selesai').length,
    dibatalkan: pesanan.filter(p => p.status === 'Dibatalkan').length,
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Admin Panel</p>
        <h1 className={styles.title}>Kelola Pesanan</h1>
        <p className={styles.subtitle}>Pantau dan kelola semua pesanan masuk</p>
      </div>

      {/* STATS */}
      <div className={styles.stats}>
        {[
          { label: 'Total', val: stats.total },
          { label: 'Menunggu', val: stats.menunggu, baru: true },
          { label: 'Dikonfirmasi', val: stats.dikonfirmasi },
          { label: 'Selesai', val: stats.selesai },
          { label: 'Dibatalkan', val: stats.dibatalkan },
        ].map(s => (
          <div key={s.label} className={`${styles.statCard} ${s.baru ? styles.statBaru : ''}`}>
            <span className={styles.statNum}>{s.val}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* FILTER */}
      <div className={styles.filterBar}>
        {['Semua', 'Menunggu', 'Dikonfirmasi', 'Selesai', 'Dibatalkan'].map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABEL */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <div>Tidak ada pesanan {filter !== 'Semua' && `dengan status "${filter}"`}</div>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Nama</th>
                <th>No. WhatsApp</th>
                <th>Layanan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ whiteSpace: 'nowrap', color: '#888', fontSize: '0.82rem' }}>{p.waktu}</td>
                  <td><strong style={{ color: '#fff' }}>{p.nama}</strong></td>
                  <td>
                    <a href={`https://wa.me/${p.no_wa?.startsWith('0') ? '62' + p.no_wa.slice(1) : p.no_wa}`}
                      target="_blank" rel="noreferrer" className={styles.waLink}>
                      📱 {p.no_wa}
                    </a>
                  </td>
                  <td>{p.layanan}</td>
                  <td>
                    <select
                      className={`${styles.statusSelect} ${styles['status' + (p.status || '').replace(/\s/g, '')]}`}
                      value={p.status}
                      onChange={e => handleChangeStatus(p.id, e.target.value)}
                    >
                      <option value="Menunggu">Menunggu</option>
                      <option value="Dikonfirmasi">Dikonfirmasi</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                  </td>
                  <td className={styles.actions}>
                    <button className={styles.btnDetail} onClick={() => setDetail(p)}>📍 Detail</button>
                    <button className={styles.btnDel} onClick={() => handleHapus(p.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DETAIL */}
      {detail && (
        <div className={styles.overlay} onClick={() => setDetail(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>📋 Detail Pesanan #{detail.id}</h2>
              <button className={styles.closeBtn} onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <strong>Nama</strong>
                <span>{detail.nama}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>No. WhatsApp</strong>
                <a href={`https://wa.me/${detail.no_wa?.startsWith('0') ? '62' + detail.no_wa.slice(1) : detail.no_wa}`}
                  target="_blank" rel="noreferrer" className={styles.waLink}>
                  📱 {detail.no_wa}
                </a>
              </div>
              <div className={styles.detailRow}>
                <strong>Alamat</strong>
                <span>{detail.alamat}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Layanan</strong>
                <span>{detail.layanan}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Waktu Pesan</strong>
                <span>{detail.waktu}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Status</strong>
                <span className={`${styles.statusBadge} ${styles['status' + (detail.status || '').replace(/\s/g, '')]}`}>
                  {detail.status}
                </span>
              </div>
              {detail.catatan && (
                <div className={styles.detailRow}>
                  <strong>Catatan</strong>
                  <span>{detail.catatan}</span>
                </div>
              )}
              {detail.lat && detail.lng ? (
                <>
                  <div className={styles.detailRow}>
                    <strong>Koordinat</strong>
                    <span>
                      <a
                        href={`https://maps.google.com/?q=${detail.lat},${detail.lng}`}
                        target="_blank" rel="noreferrer"
                        style={{ color: '#b8860b', textDecoration: 'none' }}
                      >
                        📍 {Number(detail.lat).toFixed(5)}, {Number(detail.lng).toFixed(5)}
                      </a>
                    </span>
                  </div>
                  <div className={styles.mapWrap}>
                    <MapContainer
                      center={[detail.lat, detail.lng]}
                      zoom={15}
                      scrollWheelZoom={false}
                      style={{ height: '240px', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[detail.lat, detail.lng]}>
                        <Popup>
                          <strong>{detail.nama}</strong><br />{detail.alamat}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </>
              ) : (
                <div className={styles.detailRow}>
                  <strong>Lokasi</strong>
                  <span style={{ color: '#888' }}>Tidak ada data koordinat</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
