import { useState, useEffect } from 'react';
import { getSettings, saveSettings, getPesanan } from '../../utils/storage';
import styles from './AdminHome.module.css';

export default function AdminHome() {
  const [settings, setSettings] = useState(null);
  const [tab, setTab] = useState('umum');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pesananCount, setPesananCount] = useState({ total: 0, baru: 0 });

  // Layanan editor
  const [editLayananIdx, setEditLayananIdx] = useState(null);
  const [layananForm, setLayananForm] = useState(null);

  // Testimoni editor
  const [editTestiIdx, setEditTestiIdx] = useState(null);
  const [testiForm, setTestiForm] = useState(null);

  useEffect(() => {
    getSettings().then(s => setSettings(s));
    getPesanan().then(list => setPesananCount({
      total: list.length,
      baru: list.filter(p => p.status === 'Menunggu').length,
    }));
  }, []);

  async function handleSave() {
    setSaving(true);
    await saveSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateField(field, value) {
    setSettings(prev => ({ ...prev, [field]: value }));
  }

  // === LAYANAN ===
  function startEditLayanan(idx) {
    setEditLayananIdx(idx);
    setLayananForm({ ...settings.layanan[idx] });
  }

  function startAddLayanan() {
    setEditLayananIdx('new');
    setLayananForm({ id: Date.now(), nama: '', deskripsi: '', harga: '', durasi: '', icon: '💆', gambar: '' });
  }

  function saveLayanan() {
    const updated = [...settings.layanan];
    if (editLayananIdx === 'new') {
      updated.push(layananForm);
    } else {
      updated[editLayananIdx] = layananForm;
    }
    setSettings(prev => ({ ...prev, layanan: updated }));
    setEditLayananIdx(null);
    setLayananForm(null);
  }

  function deleteLayanan(idx) {
    if (!confirm('Hapus layanan ini?')) return;
    const updated = settings.layanan.filter((_, i) => i !== idx);
    setSettings(prev => ({ ...prev, layanan: updated }));
  }

  // === TESTIMONI ===
  function startEditTesti(idx) {
    setEditTestiIdx(idx);
    setTestiForm({ ...settings.testimoni[idx] });
  }

  function startAddTesti() {
    setEditTestiIdx('new');
    setTestiForm({ nama: '', pesan: '', bintang: 5, avatar: '👤' });
  }

  function saveTesti() {
    const updated = [...settings.testimoni];
    if (editTestiIdx === 'new') {
      updated.push(testiForm);
    } else {
      updated[editTestiIdx] = testiForm;
    }
    setSettings(prev => ({ ...prev, testimoni: updated }));
    setEditTestiIdx(null);
    setTestiForm(null);
  }

  function deleteTesti(idx) {
    if (!confirm('Hapus testimoni ini?')) return;
    const updated = settings.testimoni.filter((_, i) => i !== idx);
    setSettings(prev => ({ ...prev, testimoni: updated }));
  }

  if (!settings) return <div className={styles.loading}>Memuat...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <p className={styles.eyebrow}>Admin Panel</p>
          <h1 className={styles.title}>Dashboard & Pengaturan</h1>
          <p className={styles.subtitle}>Kelola semua konten website Anda</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{pesananCount.total}</span>
            <span className={styles.statLabel}>Total Pesanan</span>
          </div>
          <div className={`${styles.statCard} ${styles.statBaru}`}>
            <span className={styles.statNum}>{pesananCount.baru}</span>
            <span className={styles.statLabel}>Pesanan Baru</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{settings.layanan.length}</span>
            <span className={styles.statLabel}>Layanan</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className={styles.tabs}>
        {[
          { key: 'umum', label: '🏠 Umum' },
          { key: 'tampilan', label: '🎨 Tampilan' },
          { key: 'layanan', label: '💆 Layanan' },
          { key: 'testimoni', label: '⭐ Testimoni' },
        ].map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>

        {/* ---- TAB UMUM ---- */}
        {tab === 'umum' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Informasi Umum</h2>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Nama Usaha</label>
                <input value={settings.nama_usaha} onChange={e => updateField('nama_usaha', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Logo / Emoji</label>
                <input value={settings.logo} onChange={e => updateField('logo', e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Tagline</label>
                <input value={settings.tagline} onChange={e => updateField('tagline', e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Deskripsi / Tentang Kami</label>
                <textarea rows={4} value={settings.deskripsi} onChange={e => updateField('deskripsi', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Nomor Telepon</label>
                <input value={settings.telepon} onChange={e => updateField('telepon', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Nomor WhatsApp (dengan kode negara, e.g. 628xxx)</label>
                <input value={settings.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Alamat</label>
                <textarea rows={2} value={settings.alamat} onChange={e => updateField('alamat', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Jam Buka</label>
                <input value={settings.jam_buka} onChange={e => updateField('jam_buka', e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Teks Footer</label>
                <input value={settings.footer_text} onChange={e => updateField('footer_text', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ---- TAB TAMPILAN ---- */}
        {tab === 'tampilan' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Tampilan & Warna</h2>
            <div className={styles.grid2}>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>URL Gambar Hero (background utama)</label>
                <input value={settings.hero_image} onChange={e => updateField('hero_image', e.target.value)} />
                {settings.hero_image && (
                  <img src={settings.hero_image} alt="preview" className={styles.imgPreview} />
                )}
              </div>
              <div className={styles.field}>
                <label>Warna Utama</label>
                <div className={styles.colorRow}>
                  <input type="color" value={settings.warna_utama} onChange={e => updateField('warna_utama', e.target.value)} className={styles.colorInput} />
                  <input type="text" value={settings.warna_utama} onChange={e => updateField('warna_utama', e.target.value)} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Warna Sekunder / Aksen</label>
                <div className={styles.colorRow}>
                  <input type="color" value={settings.warna_sekunder} onChange={e => updateField('warna_sekunder', e.target.value)} className={styles.colorInput} />
                  <input type="text" value={settings.warna_sekunder} onChange={e => updateField('warna_sekunder', e.target.value)} />
                </div>
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Preview Warna</label>
                <div className={styles.colorPreview}>
                  <div style={{ background: settings.warna_utama, flex: 1, borderRadius: '8px', padding: '1rem', color: '#fff', fontWeight: 700 }}>
                    Warna Utama
                  </div>
                  <div style={{ background: settings.warna_sekunder, flex: 1, borderRadius: '8px', padding: '1rem', color: '#fff', fontWeight: 700 }}>
                    Warna Sekunder
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---- TAB LAYANAN ---- */}
        {tab === 'layanan' && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Daftar Layanan</h2>
              <button className={styles.btnAdd} onClick={startAddLayanan}>+ Tambah Layanan</button>
            </div>

            {editLayananIdx !== null && layananForm && (
              <div className={styles.editBox}>
                <h3>{editLayananIdx === 'new' ? 'Tambah Layanan Baru' : 'Edit Layanan'}</h3>
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label>Nama Layanan</label>
                    <input value={layananForm.nama} onChange={e => setLayananForm(p => ({...p, nama: e.target.value}))} />
                  </div>
                  <div className={styles.field}>
                    <label>Icon / Emoji</label>
                    <input value={layananForm.icon} onChange={e => setLayananForm(p => ({...p, icon: e.target.value}))} />
                  </div>
                  <div className={styles.field}>
                    <label>Harga</label>
                    <input placeholder="Rp 80.000 / jam" value={layananForm.harga} onChange={e => setLayananForm(p => ({...p, harga: e.target.value}))} />
                  </div>
                  <div className={styles.field}>
                    <label>Durasi</label>
                    <input placeholder="60 menit" value={layananForm.durasi} onChange={e => setLayananForm(p => ({...p, durasi: e.target.value}))} />
                  </div>
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label>Deskripsi</label>
                    <textarea rows={3} value={layananForm.deskripsi} onChange={e => setLayananForm(p => ({...p, deskripsi: e.target.value}))} />
                  </div>
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label>URL Gambar</label>
                    <input value={layananForm.gambar} onChange={e => setLayananForm(p => ({...p, gambar: e.target.value}))} />
                    {layananForm.gambar && <img src={layananForm.gambar} alt="preview" className={styles.imgPreview} />}
                  </div>
                </div>
                <div className={styles.editActions}>
                  <button className={styles.btnSave} onClick={saveLayanan}>💾 Simpan</button>
                  <button className={styles.btnCancel} onClick={() => { setEditLayananIdx(null); setLayananForm(null); }}>Batal</button>
                </div>
              </div>
            )}

            <div className={styles.layananList}>
              {settings.layanan.map((l, idx) => (
                <div key={l.id} className={styles.layananItem}>
                  <div className={styles.layananItemImg}>
                    {l.gambar ? <img src={l.gambar} alt={l.nama} /> : <span>{l.icon}</span>}
                  </div>
                  <div className={styles.layananItemInfo}>
                    <strong>{l.icon} {l.nama}</strong>
                    <p>{l.deskripsi}</p>
                    <span>{l.harga} • {l.durasi}</span>
                  </div>
                  <div className={styles.layananItemActions}>
                    <button className={styles.btnEdit} onClick={() => startEditLayanan(idx)}>✏️ Edit</button>
                    <button className={styles.btnDel} onClick={() => deleteLayanan(idx)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- TAB TESTIMONI ---- */}
        {tab === 'testimoni' && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Testimoni Pelanggan</h2>
              <button className={styles.btnAdd} onClick={startAddTesti}>+ Tambah Testimoni</button>
            </div>

            {editTestiIdx !== null && testiForm && (
              <div className={styles.editBox}>
                <h3>{editTestiIdx === 'new' ? 'Tambah Testimoni' : 'Edit Testimoni'}</h3>
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label>Nama Pelanggan</label>
                    <input value={testiForm.nama} onChange={e => setTestiForm(p => ({...p, nama: e.target.value}))} />
                  </div>
                  <div className={styles.field}>
                    <label>Avatar / Emoji</label>
                    <input value={testiForm.avatar} onChange={e => setTestiForm(p => ({...p, avatar: e.target.value}))} />
                  </div>
                  <div className={styles.field}>
                    <label>Bintang (1-5)</label>
                    <select value={testiForm.bintang} onChange={e => setTestiForm(p => ({...p, bintang: parseInt(e.target.value)}))}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                    </select>
                  </div>
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label>Pesan / Ulasan</label>
                    <textarea rows={3} value={testiForm.pesan} onChange={e => setTestiForm(p => ({...p, pesan: e.target.value}))} />
                  </div>
                </div>
                <div className={styles.editActions}>
                  <button className={styles.btnSave} onClick={saveTesti}>💾 Simpan</button>
                  <button className={styles.btnCancel} onClick={() => { setEditTestiIdx(null); setTestiForm(null); }}>Batal</button>
                </div>
              </div>
            )}

            <div className={styles.testiList}>
              {settings.testimoni.map((t, idx) => (
                <div key={idx} className={styles.testiItem}>
                  <span className={styles.testiAva}>{t.avatar}</span>
                  <div className={styles.testiInfo}>
                    <strong>{t.nama}</strong>
                    <p>{'⭐'.repeat(t.bintang)}</p>
                    <p className={styles.testiMsg}>"{t.pesan}"</p>
                  </div>
                  <div className={styles.layananItemActions}>
                    <button className={styles.btnEdit} onClick={() => startEditTesti(idx)}>✏️ Edit</button>
                    <button className={styles.btnDel} onClick={() => deleteTesti(idx)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SAVE BUTTON */}
        <div className={styles.saveBar}>
          <span className={styles.saveHint}>Perubahan belum disimpan otomatis</span>
          <button className={`${styles.btnSaveMain} ${saved ? styles.savedAnim : ''}`} onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Menyimpan...' : saved ? '✅ Tersimpan!' : '💾 Simpan Semua Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}
