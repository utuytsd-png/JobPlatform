import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Application {
  id: number;
  vacancyTitle: string;
  vacancyCompany: string;
  coverLetter: string;
  status: string;
  appliedAt: string;
}

function getCompanyInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getCompanyColor(name: string) {
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/applications/my')
      .then(res => setApplications(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING': return { icon: '⏳', label: 'На розгляді', color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' };
      case 'ACCEPTED': return { icon: '✨', label: 'Прийнято', color: '#10b981', bg: '#d1fae5', border: '#a7f3d0' };
      case 'REJECTED': return { icon: '🛑', label: 'Відхилено', color: '#ef4444', bg: '#fee2e2', border: '#fecaca' };
      default: return { icon: '📋', label: status, color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' };
    }
  };

  if (loading) return (
    <div style={s.center}>
      <div style={s.spinner} />
      <p style={{ color: '#6b7280', marginTop: '1rem' }}>Завантажуємо відгуки...</p>
    </div>
  );

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.title}>Мої відгуки</h1>
        <p style={s.subtitle}>Історія ваших заявок на вакансії. Бажаємо успіхів!</p>
      </div>

      {applications.length === 0 ? (
        <div style={s.emptyBox}>
          <div style={s.emptyIcon}>📭</div>
          <h2 style={s.emptyTitle}>Ви ще не відгукнулись на жодну вакансію</h2>
          <p style={s.emptyText}>Знайдіть компанію своєї мрії та надішліть свій перший відгук просто зараз.</p>
          <button style={s.findBtn} onClick={() => navigate('/vacancies')}>
            Почати пошук роботи
          </button>
        </div>
      ) : (
        <div style={s.grid}>
          {applications.map(app => {
            const companyColor = getCompanyColor(app.vacancyCompany);
            const statusCfg = getStatusConfig(app.status);
            
            return (
              <div key={app.id} style={s.card}>
                <div style={{ ...s.statusRibbon, background: statusCfg.bg, borderBottom: `1px solid ${statusCfg.border}` }}>
                  <span style={{ color: statusCfg.color, fontWeight: 700, fontSize: '0.85rem' }}>
                    {statusCfg.icon} {statusCfg.label}
                  </span>
                  <span style={s.date}>
                    {new Date(app.appliedAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div style={s.cardBody}>
                  <div style={s.cardTop}>
                    <div style={{ ...s.companyLogo, background: companyColor }}>
                      {getCompanyInitials(app.vacancyCompany)}
                    </div>
                    <div>
                      <h3 style={s.jobTitle}>{app.vacancyTitle}</h3>
                      <p style={s.companyName}>{app.vacancyCompany}</p>
                    </div>
                  </div>

                  <div style={s.letterBox}>
                    <div style={s.letterHeader}>Ваш супровідний лист:</div>
                    <p style={s.letterText}>{app.coverLetter}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' },
  center: { textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  
  header: { marginBottom: '2.5rem' },
  title: { fontSize: '2.25rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem', letterSpacing: '-0.02em' },
  subtitle: { color: '#6b7280', fontSize: '1.05rem', margin: 0 },
  
  emptyBox: { background: 'white', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' },
  emptyIcon: { fontSize: '4rem', marginBottom: '1.5rem' },
  emptyTitle: { fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.75rem', color: '#111827' },
  emptyText: { color: '#6b7280', margin: '0 auto 2rem', lineHeight: 1.6, maxWidth: '400px' },
  findBtn: { display: 'inline-block', padding: '0.875rem 2rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' },
  
  grid: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' },
  
  statusRibbon: { padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: '#6b7280', fontSize: '0.8rem', fontWeight: 500 },
  
  cardBody: { padding: '1.5rem' },
  cardTop: { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' },
  companyLogo: { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 },
  jobTitle: { fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.2rem', color: '#111827', lineHeight: 1.3 },
  companyName: { color: '#6b7280', fontSize: '0.95rem', margin: 0 },
  
  letterBox: { background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #f1f5f9' },
  letterHeader: { fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' },
  letterText: { margin: 0, color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
};
