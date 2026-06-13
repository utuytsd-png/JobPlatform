import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', role: 'JOB_SEEKER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/register', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/vacancies');
    } catch {
      setError('Помилка реєстрації. Можливо email вже використовується');
    } finally {
      setLoading(false);
    }
  };

  const isEmployer = form.role === 'EMPLOYER';

  return (
    <div style={s.container}>
      <div style={s.cardWrapper}>
        <div style={s.brand}>
          <span style={s.brandIcon}>🚀</span>
          <h1 style={s.brandText}>JobPlatform</h1>
        </div>

        <div style={s.card}>
          <h2 style={s.title}>Створити акаунт ✨</h2>
          <p style={s.subtitle}>Приєднуйтесь до найкращої платформи для пошуку роботи</p>

          {error && <div style={s.errorBadge}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            {/* Роль - великі кнопки */}
            <div style={s.roleSelector}>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'JOB_SEEKER' })}
                style={{
                  ...s.roleBtn,
                  ...(form.role === 'JOB_SEEKER' ? s.roleBtnActive : s.roleBtnInactive)
                }}
              >
                <div style={s.roleIcon}>👤</div>
                <div>
                  <div style={s.roleTitle}>Шукач роботи</div>
                  <div style={s.roleDesc}>Шукаю роботу</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'EMPLOYER' })}
                style={{
                  ...s.roleBtn,
                  ...(form.role === 'EMPLOYER' ? s.roleBtnActive : s.roleBtnInactive)
                }}
              >
                <div style={s.roleIcon}>🏢</div>
                <div>
                  <div style={s.roleTitle}>Роботодавець</div>
                  <div style={s.roleDesc}>Шукаю кандидатів</div>
                </div>
              </button>
            </div>

            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>{isEmployer ? "Ім'я представника" : "Ім'я"}</label>
                <input
                  style={s.input}
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Іван"
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Прізвище</label>
                <input
                  style={s.input}
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Франко"
                  required
                />
              </div>
            </div>

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
                placeholder="Мінімум 6 символів"
                required
              />
            </div>

            <button style={{ ...s.button, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Створення акаунту...' : 'Зареєструватись'}
            </button>
          </form>

          <p style={s.footerText}>
            Вже маєте акаунт? <Link to="/login" style={s.link}>Увійти</Link>
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
    maxWidth: '550px',
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
    border: '1px solid #e5e7eb',
    boxSizing: 'border-box'
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
  roleSelector: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '0.5rem'
  },
  roleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '12px',
    borderWidth: '2px', borderStyle: 'solid', borderColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    background: 'white'
  },
  roleBtnActive: {
    borderColor: '#4f46e5',
    background: '#eef2ff'
  },
  roleBtnInactive: {
    borderColor: '#e5e7eb',
  },
  roleIcon: {
    fontSize: '1.75rem',
    background: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  roleTitle: {
    fontWeight: 600,
    color: '#111827',
    fontSize: '0.95rem',
    marginBottom: '0.1rem'
  },
  roleDesc: {
    color: '#6b7280',
    fontSize: '0.8rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
    marginTop: '1rem',
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
