import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data, res.data.token);
      navigate('/vacancies');
    } catch {
      setError('Невірний email або пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.cardWrapper}>
        {/* Brand */}
        <div style={s.brand}>
          <span style={s.brandIcon}>🚀</span>
          <h1 style={s.brandText}>JobPlatform</h1>
        </div>

        <div style={s.card}>
          <h2 style={s.title}>Ласкаво просимо! 👋</h2>
          <p style={s.subtitle}>Увійдіть до свого акаунту для продовження</p>

          {error && <div style={s.errorBadge}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Електронна пошта</label>
              <input
                style={s.input}
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Пароль</label>
              <input
                style={s.input}
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            
            <button style={{ ...s.button, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Вхід...' : 'Увійти'}
            </button>
          </form>

          <p style={s.footerText}>
            Ще не маєте акаунту? <Link to="/register" style={s.link}>Створити акаунт</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { 
    minHeight: 'calc(100vh - 4rem)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    background: '#f8fafc',
    padding: '2rem 1rem'
  },
  cardWrapper: {
    width: '100%',
    maxWidth: '440px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem'
  },
  brandIcon: {
    fontSize: '2rem'
  },
  brandText: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.025em'
  },
  card: { 
    background: 'white', 
    padding: '2.5rem', 
    borderRadius: '16px', 
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
    width: '100%',
    border: '1px solid #e5e7eb'
  },
  title: { 
    margin: '0 0 0.5rem', 
    fontSize: '1.5rem', 
    fontWeight: 700, 
    color: '#111827' 
  },
  subtitle: {
    margin: '0 0 2rem',
    color: '#6b7280',
    fontSize: '0.95rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  field: { 
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: { 
    fontWeight: 600, 
    color: '#374151',
    fontSize: '0.9rem'
  },
  input: { 
    width: '100%', 
    padding: '0.875rem 1rem', 
    border: '1px solid #d1d5db', 
    borderRadius: '8px', 
    fontSize: '1rem', 
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#111827'
  },
  button: { 
    width: '100%', 
    padding: '0.875rem', 
    background: '#4f46e5', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '1rem', 
    fontWeight: 600,
    cursor: 'pointer', 
    marginTop: '0.5rem',
    transition: 'background-color 0.2s',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
  },
  errorBadge: { 
    background: '#fef2f2', 
    color: '#b91c1c', 
    padding: '0.75rem', 
    borderRadius: '8px', 
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  footerText: { 
    textAlign: 'center', 
    marginTop: '2rem', 
    color: '#6b7280',
    fontSize: '0.95rem',
    margin: '2rem 0 0 0'
  },
  link: {
    color: '#4f46e5',
    fontWeight: 600,
    textDecoration: 'none'
  }
};