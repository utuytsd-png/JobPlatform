import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Vacancy {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  employmentType: string;
  requiredSkills: string;
  employerFirstName: string;
  employerLastName: string;
  createdAt: string;
}

function getCompanyColor(name: string) {
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getCompanyInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function VacancyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/vacancies/${id}`)
      .then(res => setVacancy(res.data))
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/api/applications', { vacancyId: Number(id), coverLetter });
      setApplied(true);
      setMessage('Ваш відгук успішно надіслано! Удачі! 🎉');
      setCoverLetter('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка при відправці відгуку');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return (
    <div style={s.loadingPage}>
      <div style={s.spinner} />
      <p style={{ color: '#6b7280', marginTop: '1rem' }}>Завантажуємо вакансію...</p>
    </div>
  );

  if (!vacancy) return (
    <div style={s.loadingPage}>
      <p style={{ color: '#dc2626' }}>Вакансію не знайдено.</p>
      <Link to="/vacancies" style={s.backLink}>← Повернутись до вакансій</Link>
    </div>
  );

  const color = getCompanyColor(vacancy.company);
  const skills = vacancy.requiredSkills ? vacancy.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div style={s.page}>
      {/* Hero header */}
      <div style={{ ...s.heroBar, background: `linear-gradient(135deg, ${color}dd, ${color}99)` }}>
        <div style={s.heroInner}>
          <Link to="/vacancies" style={s.backBtn}>← Всі вакансії</Link>
          <div style={s.heroContent}>
            <div style={{ ...s.companyLogo, background: 'rgba(255,255,255,0.2)' }}>
              {getCompanyInitials(vacancy.company)}
            </div>
            <div>
              <h1 style={s.heroTitle}>{vacancy.title}</h1>
              <p style={s.heroCompany}>{vacancy.company}</p>
            </div>
          </div>

          {/* Meta chips */}
          <div style={s.heroBadges}>
            {vacancy.location && <span style={s.heroBadge}>📍 {vacancy.location}</span>}
            {vacancy.employmentType && <span style={s.heroBadge}>🕒 {vacancy.employmentType}</span>}
            {vacancy.salary && <span style={{ ...s.heroBadge, ...s.salaryHeroBadge }}>💰 {vacancy.salary}</span>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>
        {/* Left: main content */}
        <div style={s.mainCol}>
          {/* Description */}
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Опис вакансії</h2>
            <p style={s.descText}>{vacancy.description}</p>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div style={s.card}>
              <h2 style={s.sectionTitle}>Необхідні навички</h2>
              <div style={s.skillsGrid}>
                {skills.map((skill, i) => (
                  <span key={i} style={s.skillTag}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Apply form for job seekers */}
          {user?.role === 'JOB_SEEKER' && (
            <div style={s.card}>
              <h2 style={s.sectionTitle}>Відгукнутись на вакансію</h2>
              {applied ? (
                <div style={s.successBox}>
                  <div style={{ fontSize: '2.5rem' }}>🎉</div>
                  <h3 style={{ margin: '0.5rem 0', color: '#166534' }}>Відгук надіслано!</h3>
                  <p style={{ color: '#15803d', margin: 0 }}>{message}</p>
                </div>
              ) : (
                <form onSubmit={handleApply}>
                  {error && <div style={s.errorBox}>{error}</div>}
                  <label style={s.label}>Супровідний лист</label>
                  <p style={s.labelHint}>Розкажіть роботодавцю про свій досвід і чому саме ви підходите на цю посаду</p>
                  <textarea
                    style={s.textarea}
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    placeholder={`Здрастуйте!\n\nМене зацікавила ваша вакансія "${vacancy.title}" в компанії ${vacancy.company}...\n\nМій досвід включає:\n• ...\n\nБуду радий(а) обговорити деталі!`}
                    rows={8}
                    required
                  />
                  <button
                    style={{ ...s.submitBtn, background: loading ? '#9ca3af' : color }}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? '⏳ Надсилаємо...' : '📨 Надіслати відгук'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Employer controls */}
          {user?.role === 'EMPLOYER' && (
            <div style={s.card}>
              <h2 style={s.sectionTitle}>Керування вакансією</h2>
              <div style={s.employerBtns}>
                <button style={{ ...s.empBtn, background: color }} onClick={() => navigate(`/vacancies/${id}/edit`)}>
                  ✏️ Редагувати
                </button>
                <button style={{ ...s.empBtn, background: '#7c3aed' }} onClick={() => navigate(`/vacancies/${id}/applications`)}>
                  📋 Заявки кандидатів
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: sidebar */}
        <div style={s.sidebar}>
          <div style={s.sideCard}>
            <h3 style={s.sideTitle}>Про компанію</h3>
            <div style={{ ...s.sideLogoLg, background: color }}>
              {getCompanyInitials(vacancy.company)}
            </div>
            <p style={s.sideName}>{vacancy.company}</p>
            {vacancy.location && <p style={s.sideMeta}>📍 {vacancy.location}</p>}
          </div>

          <div style={s.sideCard}>
            <h3 style={s.sideTitle}>Деталі вакансії</h3>
            <div style={s.detailItem}>
              <span style={s.detailIcon}>💼</span>
              <div>
                <p style={s.detailLabel}>Тип зайнятості</p>
                <p style={s.detailValue}>{vacancy.employmentType || 'Не вказано'}</p>
              </div>
            </div>
            <div style={s.detailItem}>
              <span style={s.detailIcon}>💰</span>
              <div>
                <p style={s.detailLabel}>Зарплата</p>
                <p style={{ ...s.detailValue, color: '#15803d', fontWeight: 700 }}>{vacancy.salary || 'Договірна'}</p>
              </div>
            </div>
            <div style={s.detailItem}>
              <span style={s.detailIcon}>📅</span>
              <div>
                <p style={s.detailLabel}>Опубліковано</p>
                <p style={s.detailValue}>
                  {vacancy.createdAt ? new Date(vacancy.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
            <div style={s.detailItem}>
              <span style={s.detailIcon}>👤</span>
              <div>
                <p style={s.detailLabel}>Контактна особа</p>
                <p style={s.detailValue}>{vacancy.employerFirstName} {vacancy.employerLastName}</p>
              </div>
            </div>
          </div>

          {user?.role === 'JOB_SEEKER' && !applied && (
            <button
              style={{ ...s.applySideBtn, background: color }}
              onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              📨 Відгукнутись
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  loadingPage: { minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  backLink: { color: '#4f46e5', textDecoration: 'none', fontSize: '0.95rem', marginTop: '1rem', display: 'inline-block' },

  // Hero
  heroBar: { padding: '2.5rem 1.5rem 2rem', color: 'white' },
  heroInner: { maxWidth: '1100px', margin: '0 auto' },
  backBtn: { display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1.5rem', transition: 'color 0.2s' },
  heroContent: { display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  companyLogo: { width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.4rem', fontWeight: 800, flexShrink: 0, backdropFilter: 'blur(10px)' },
  heroTitle: { margin: '0 0 0.25rem', fontSize: 'clamp(1.4rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.02em' },
  heroCompany: { margin: 0, opacity: 0.85, fontSize: '1.1rem' },
  heroBadges: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  heroBadge: { background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '999px', padding: '0.35rem 0.9rem', fontSize: '0.875rem', color: 'white' },
  salaryHeroBadge: { background: 'rgba(52,211,153,0.25)', border: '1px solid rgba(52,211,153,0.4)', fontWeight: 700 },

  // Body layout
  body: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' },
  mainCol: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '4.5rem' },

  // Cards
  card: { background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e5e7eb' },
  sectionTitle: { fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: '0 0 1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f3f4f6' },

  // Description
  descText: { color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-wrap', margin: 0, fontSize: '0.975rem' },

  // Skills
  skillsGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  skillTag: { background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', color: '#4338ca', borderRadius: '8px', padding: '0.4rem 0.9rem', fontSize: '0.875rem', fontWeight: 600, border: '1px solid #c7d2fe' },

  // Apply form
  label: { display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' },
  labelHint: { color: '#6b7280', fontSize: '0.85rem', margin: '0 0 1rem' },
  textarea: { width: '100%', padding: '1rem', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7, transition: 'border-color 0.2s', outline: 'none' },
  submitBtn: { width: '100%', padding: '0.9rem', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: '1rem', transition: 'opacity 0.2s', letterSpacing: '0.01em' },

  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', textAlign: 'center', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },

  // Employer
  employerBtns: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  empBtn: { flex: 1, minWidth: '160px', padding: '0.85rem', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' },

  // Sidebar cards
  sideCard: { background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e5e7eb' },
  sideTitle: { fontWeight: 700, color: '#374151', margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' },
  sideLogoLg: { width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.3rem', fontWeight: 800, margin: '0 auto 0.75rem' },
  sideName: { textAlign: 'center', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem', fontSize: '1.05rem' },
  sideMeta: { textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', margin: 0 },

  detailItem: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 0', borderBottom: '1px solid #f9fafb' },
  detailIcon: { fontSize: '1.25rem', flexShrink: 0 },
  detailLabel: { margin: '0 0 0.15rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' },
  detailValue: { margin: 0, color: '#111827', fontWeight: 500, fontSize: '0.9rem' },

  applySideBtn: { width: '100%', padding: '0.9rem', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
};