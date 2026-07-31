import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { tambahPesanan } from '../utils/storage';
import styles from './OrderModal.module.css';

// Fix icon leaflet di Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position}></Marker> : null;
}

export default function OrderModal({ settings, layanan, selectedLayanan, onClose, inline = false }) {
  const [nama, setNama] = useState('');
  const [noWa, setNoWa] = useState('');
  const [alamat, setAlamat] = useState('');
  const [layananId, setLayananId] = useState(selectedLayanan?.id || layanan[0]?.id || '');
  const [position, setPosition] = useState(null);
  const [useCurrent, setUseCurrent] = useState(false);

  useEffect(() => {
    if (selectedLayanan) {
      setLayananId(selectedLayanan.id);
    }
  }, [selectedLayanan]);

  function handleGetLocation() {
    setUseCurrent(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
        },
        (err) => {
          alert('Gagal mendapatkan lokasi. Silakan pilih lokasi di peta.');
          setUseCurrent(false);
        }
      );
    } else {
      alert('Geolocation tidak didukung browser Anda');
      setUseCurrent(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!nama || !noWa || !alamat || !layananId) {
      alert('Mohon isi semua field');
      return;
    }
    if (!position) {
      alert('Mohon bagikan lokasi Anda dengan klik pada peta atau tombol Lokasi Saya');
      return;
    }

    const selectedLay = layanan.find((l) => l.id === parseInt(layananId));

    const pesanan = {
      nama,
      no_wa: noWa,
      alamat,
      layanan: selectedLay.nama,
      harga: selectedLay.harga,
      lat: position.lat,
      lng: position.lng,
    };

    tambahPesanan(pesanan);
    alert('✅ Pesanan berhasil dikirim! Kami akan segera menghubungi Anda.');
    setNama('');
    setNoWa('');
    setAlamat('');
    setLayananId(layanan[0]?.id || '');
    setPosition(null);
    setUseCurrent(false);
    if (!inline) onClose();
  }

  const defaultCenter = position || { lat: -6.2, lng: 106.816666 };

  const content = (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label>Nama Lengkap</label>
        <input
          type="text"
          placeholder="Masukkan nama Anda"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Nomor WhatsApp</label>
        <input
          type="tel"
          placeholder="08xxxxxxxxxx"
          value={noWa}
          onChange={(e) => setNoWa(e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Alamat Lengkap</label>
        <textarea
          placeholder="Masukkan alamat lengkap Anda"
          rows={3}
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Pilih Layanan</label>
        <select value={layananId} onChange={(e) => setLayananId(e.target.value)} required>
          {layanan.map((l) => (
            <option key={l.id} value={l.id}>
              {l.icon} {l.nama} - {l.harga}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label>📍 Bagikan Lokasi Anda (Klik pada peta atau gunakan GPS)</label>
        <button
          type="button"
          className={styles.btnLocation}
          onClick={handleGetLocation}
          style={{ background: settings?.warna_sekunder || '#52b788' }}
        >
          📍 Gunakan Lokasi Saya
        </button>
        <div className={styles.mapWrap}>
          <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>
        {position && (
          <p className={styles.locInfo}>
            ✅ Lokasi terpilih: Lat {position.lat.toFixed(5)}, Lng {position.lng.toFixed(5)}
          </p>
        )}
      </div>
      <button
        type="submit"
        className={styles.btnSubmit}
        style={{ background: settings?.warna_utama || '#2d6a4f' }}
      >
        🚀 Kirim Pesanan
      </button>
    </form>
  );

  if (inline) {
    return <div className={styles.inlineWrap}>{content}</div>;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>📝 Form Pemesanan</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>{content}</div>
      </div>
    </div>
  );
}
