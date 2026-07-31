import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../utils/storage';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    if (adminLogin(username, password)) {
      sessionStorage.setItem('admin_login', 'true');
      navigate('/admin');
    } else {
      alert('Username atau password salah!');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.loginBox}>
        <div className={styles.icon}>🔐</div>
        <h1 className={styles.title}>Login Admin</h1>
        <p className={styles.subtitle}>Silakan masuk untuk mengelola pesanan & pengaturan</p>
        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label>Username</label>
            <input
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.btnLogin}>
            Masuk
          </button>
        </form>
        <div className={styles.hint}>
          <small>💡 Default: admin / admin123</small>
        </div>
        <button className={styles.btnBack} onClick={() => navigate('/')}>
          ← Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
