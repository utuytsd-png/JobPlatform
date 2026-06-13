import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Vacancy {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  employmentType: string;
  description: string;
  requiredSkills: string;
  createdAt: string;
}

const EMPLOYMENT_TYPES = ['Всі', 'Повна зайнятість', 'Часткова зайнятість', 'Remote', 'Стажування'];

function getCompanyInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getCompanyColor(name: string) {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  ];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function timeAgo(dateStr: string) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Щойно';
  if (diff < 3600) return `${Math.floor(diff / 60)} хв тому`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} год тому`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн тому`;
  return new Date(dateStr).toLocaleDateString('uk-UA');
}

export default function VacanciesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('Всі');
  const [locationFilter, setLocationFilter] = useState('');
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVacancies();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, activeType, locationFilter]);

  useEffect(() => {
    if (user?.role === 'JOB_SEEKER') {
      api.get('/api/saved-vacancies').then(res => {
        setSavedIds(new Set(res.data.map((v: any) => v.id)));
      });
    }
  }, [user]);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/vacancies', {
        params: {
          query: searchTerm,
          location: locationFilter,
          employmentType: activeType === 'Всі' ? '' : activeType
        }
      });
      setVacancies(Array.isArray(res.data) ? res.data : res.data.content || []);
    } catch (err) {
      setError('Не вдалося завантажити вакансії.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <h1 style={s.heroTitle}>Знайди роботу мрії</h1>
          <p style={s.heroSub}>Тисячі вакансій від кращих компаній України</p>
          <div style={s.searchWrap}>
            <div style={s.searchBox}>
              <span style={s.searchIcon}>🔍</span>
              <input
                style={s.searchInput}
                placeholder="Посада, компанія, навичка..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={s.locationBox}>
              <span style={s.searchIcon}>📍</span>
              <input
                style={s.searchInput}
                placeholder="Місто..."
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
              />
            </div>
            {user?.role === 'EMPLOYER' && (
              <button style={s.postBtn} onClick={() => navigate('/vacancies/create')}>
                + Нова вакансія
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={s.filtersRow}>
        <div style={s.filtersInner}>
          <span style={s.filterLabel}>Тип:</span>
          {EMPLOYMENT_TYPES.map(t => (
            <button
              key={t}
              style={{ ...s.filterChip, ...(activeType === t ? s.filterChipActive : {}) }}
              onClick={() => setActiveType(t)}
            >
              {t}
            </button>
          ))}
          <span style={s.countBadge}>{vacancies.length} вакансій</span>
        </div>
      </div>

      {/* Content */}
      <div style={s.main}>
        {loading ? (
          <div style={s.center}>
            <div style={s.spinner} />
            <p style={{ color: '#6b7280', marginTop: '1rem' }}>Завантажуємо вакансії...</p>
          </div>
        ) : error ? (
          <div style={s.errorBox}>{error}</div>
        ) : vacancies.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: '3rem' }}>🔎</div>
            <h3 style={{ color: '#374151', margin: '0.5rem 0' }}>Нічого не знайдено</h3>
            <p style={{ color: '#9ca3af' }}>Спробуйте змінити фільтри або пошуковий запит</p>
          </div>
        ) : (
          <div style={s.grid}>
            {vacancies.map(v => {
              const color = getCompanyColor(v.company);
              const isHovered = hoveredId === v.id;
              return (
                <div
                  key={v.id}
                  style={{ ...s.card, ...(isHovered ? s.cardHover : {}) }}
                  onMouseEnter={() => setHoveredId(v.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Card top */}
                  <div style={s.cardTop}>
                    <div style={{ ...s.companyLogo, background: color }}>
                      {getCompanyInitials(v.company)}
                    </div>
                    <div style={s.cardTopRight}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', marginRight: '0.5rem' }}>
                        {v.employmentType && (
                          <span style={{ ...s.typeBadge, ...getTypeBadgeStyle(v.employmentType) }}>
                            {v.employmentType}
                          </span>
                        )}
                        {v.createdAt && <span style={s.timeAgo}>{timeAgo(v.createdAt)}</span>}
                      </div>
                      {user?.role === 'JOB_SEEKER' && (
                        <button 
                          style={s.heartBtn} 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            api.post(`/api/saved-vacancies/${v.id}`).then(r => {
                              setSavedIds(prev => {
                                const next = new Set(prev);
                                r.data.saved ? next.add(v.id) : next.delete(v.id);
                                return next;
                              });
                            });
                          }}
                          title="Зберегти вакансію"
                        >
                          {savedIds.has(v.id) ? '💛' : '🤍'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & company */}
                  <h3 style={s.cardTitle}>{v.title}</h3>
                  <p style={s.cardCompany}>{v.company}</p>

                  {/* Location & salary */}
                  <div style={s.metaRow}>
                    {v.location && <span style={s.metaChip}>📍 {v.location}</span>}
                    {v.salary && <span style={{ ...s.metaChip, ...s.salaryChip }}>💰 {v.salary}</span>}
                  </div>

                  {/* Skills */}
                  {v.requiredSkills && (
                    <div style={s.skillsRow}>
                      {v.requiredSkills.split(',').slice(0, 4).map((sk, i) => (
                        <span key={i} style={s.skillTag}>{sk.trim()}</span>
                      ))}
                      {v.requiredSkills.split(',').length > 4 && (
                        <span style={s.skillMore}>+{v.requiredSkills.split(',').length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <p style={s.desc}>
                    {v.description.length > 110 ? v.description.slice(0, 110) + '…' : v.description}
                  </p>

                  {/* Footer */}
                  <div style={s.cardFooter}>
                    <Link to={`/vacancies/${v.id}`} style={{ ...s.applyBtn, background: isHovered ? '#4338ca' : color }}>
                      Переглянути →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getTypeBadgeStyle(type: string): React.CSSProperties {
  switch (type) {
    case 'Remote': return { background: '#dbeafe', color: '#1d4ed8' };
    case 'Стажування': return { background: '#fef3c7', color: '#b45309' };
    case 'Часткова зайнятість': return { background: '#f3e8ff', color: '#7c3aed' };
    default: return { background: '#dcfce7', color: '#15803d' };
  }
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" },

  // Hero
  hero: {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
    padding: '4rem 1.5rem 3rem',
  },
  heroInner: { maxWidth: '900px', margin: '0 auto', textAlign: 'center' },
  heroTitle: { fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', margin: '0 0 0.75rem', letterSpacing: '-0.02em' },
  heroSub: { color: '#c7d2fe', fontSize: '1.1rem', margin: '0 0 2rem' },
  searchWrap: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '700px', margin: '0 auto' },
  searchBox: { flex: 2, minWidth: '220px', display: 'flex', alignItems: 'center', background: 'white', borderRadius: '10px', padding: '0 1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' },
  locationBox: { flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', background: 'white', borderRadius: '10px', padding: '0 1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' },
  searchIcon: { fontSize: '1.1rem', marginRight: '0.5rem', opacity: 0.5 },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '1rem', padding: '0.875rem 0', background: 'transparent', color: '#1f2937' },
  postBtn: { background: '#a78bfa', color: 'white', border: 'none', borderRadius: '10px', padding: '0.875rem 1.5rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(167,139,250,0.4)' },

  // Filters
  filtersRow: { background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 },
  filtersInner: { maxWidth: '1200px', margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
  filterLabel: { color: '#6b7280', fontSize: '0.875rem', fontWeight: 500, marginRight: '0.25rem' },
  filterChip: { border: '1px solid #e5e7eb', background: 'white', borderRadius: '999px', padding: '0.35rem 0.9rem', fontSize: '0.85rem', cursor: 'pointer', color: '#374151', fontWeight: 500, transition: 'all 0.15s' },
  filterChipActive: { background: '#4f46e5', color: 'white', border: '1px solid #4f46e5' },
  countBadge: { marginLeft: 'auto', background: '#f3f4f6', color: '#6b7280', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 },

  // Main
  main: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' },

  // Card
  card: {
    background: 'white', borderRadius: '16px', padding: '1.5rem',
    borderWidth: '1px', borderStyle: 'solid', borderColor: '#e5e7eb', cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
  },
  cardHover: { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(79,70,229,0.12)', borderColor: '#c7d2fe' },

  // Card content
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  companyLogo: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em', flexShrink: 0 },
  cardTopRight: { display: 'flex', gap: '0.5rem', alignItems: 'flex-start' },
  typeBadge: { borderRadius: '999px', padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: 600 },
  timeAgo: { color: '#9ca3af', fontSize: '0.75rem' },
  heartBtn: { background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', padding: '0', transition: 'transform 0.2s' },

  cardTitle: { margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#111827', lineHeight: 1.35 },
  cardCompany: { margin: 0, color: '#6b7280', fontSize: '0.9rem' },

  metaRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  metaChip: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.8rem', color: '#4b5563' },
  salaryChip: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 600 },

  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  skillTag: { background: '#eef2ff', color: '#4f46e5', borderRadius: '5px', padding: '0.2rem 0.55rem', fontSize: '0.78rem', fontWeight: 500 },
  skillMore: { background: '#f3f4f6', color: '#6b7280', borderRadius: '5px', padding: '0.2rem 0.55rem', fontSize: '0.78rem' },

  desc: { margin: 0, color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.6, flex: 1 },

  cardFooter: { marginTop: '0.25rem', display: 'flex', justifyContent: 'flex-end' },
  applyBtn: { display: 'inline-block', color: 'white', textDecoration: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, transition: 'background 0.2s' },

  // States
  center: { textAlign: 'center', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  empty: { textAlign: 'center', padding: '5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '10px', textAlign: 'center', maxWidth: '500px', margin: '2rem auto' },
};
