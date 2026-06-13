import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

interface Application {
  id: number;
  applicantId: number;
  applicantFirstName: string;
  applicantLastName: string;
  applicantEmail: string;
  coverLetter: string;
  status: string;
  appliedAt: string;
}

export default function VacancyApplicationsPage() {
  const { id } = useParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/applications/vacancy/${id}`)
      .then(res => setApplications(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (appId: number, status: string) => {
    try {
      await api.put(`/api/applications/${appId}/status`, { status });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (e) {
      console.error(e);
      alert('Помилка при оновленні статусу');
    }
  };

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
      <p style={{ color: '#6b7280', marginTop: '1rem' }}>Завантажуємо заявки...</p>
    </div>
  );

  return (
    <div style={s.container}>
      <div style={s.headerGroup}>
        <Link to={`/vacancies/${id}`} style={s.backBtn}>← До вакансії</Link>
        <h1 style={s.pageTitle}>Відгуки кандидатів</h1>
        <p style={s.pageDesc}>Переглядайте заявки та обирайте найкращих спеціалістів у вашу команду.</p>
      </div>

      {applications.length === 0 ? (
        <div style={s.emptyBox}>
          <div style={s.emptyIcon}>📭</div>
          <h2 style={s.emptyTitle}>На цю вакансію ще немає відгуків</h2>
          <p style={s.emptyText}>Зачекайте трохи, кандидати скоро почнуть надсилати свої резюме.</p>
        </div>
      ) : (
        <div style={s.grid}>
          {applications.map(app => {
            const statusCfg = getStatusConfig(app.status);
            
            return (
              <div key={app.id} style={{ ...s.card, borderColor: app.status === 'PENDING' ? '#e5e7eb' : statusCfg.border }}>
                <div style={s.cardTop}>
                  <div style={s.userInfo}>
                    <div style={s.avatar}>
                      {app.applicantFirstName?.[0] || app.applicantEmail?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 style={s.userName}>{app.applicantFirstName} {app.applicantLastName}</h3>
                      <div style={s.userMetaRow}>
                        <span style={s.userEmail}>✉️ {app.applicantEmail}</span>
                        <span style={s.dateDot}>•</span>
                        <span style={s.date}>{new Date(app.appliedAt).toLocaleDateString('uk-UA')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <span style={{ ...s.statusBadge, background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                    {statusCfg.icon} {statusCfg.label}
                  </span>
                </div>

                <div style={s.letterBox}>
                  <p style={s.letterText}>{app.coverLetter}</p>
                  <div style={{ marginTop: '1rem', borderTop: '1px dashed #cbd5e1', paddingTop: '1rem' }}>
                    <button 
                      onClick={() => {
                        api.get(`/api/profile/resume/file/${app.applicantId}`, { responseType: 'blob' })
                           .then(res => {
                              const disposition = res.headers['content-disposition'];
                              let filename = 'resume.file';
                              if (disposition) {
                                const mx = disposition.match(/filename="?([^"]+)"?/);
                                if (mx && mx.length === 2) filename = mx[1];
                              }
                              const url = window.URL.createObjectURL(new Blob([res.data]));
                              const link = document.createElement('a'); link.href = url; link.setAttribute('download', filename); document.body.appendChild(link); link.click(); link.remove();
                           })
                           .catch(() => alert('У користувача немає завантаженого файлу резюме'));
                      }}
                      style={s.downloadResumeBtn}>
                      📄 Завантажити резюме (PDF)
                    </button>
                  </div>
                </div>

                {app.status === 'PENDING' && (
                  <div style={s.actions}>
                    <button style={s.acceptBtn} onClick={() => updateStatus(app.id, 'ACCEPTED')}>
                      ✅ Прийняти кандидата
                    </button>
                    <button style={s.rejectBtn} onClick={() => updateStatus(app.id, 'REJECTED')}>
                      ❌ Відхилити
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto' },
  center: { textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  
  headerGroup: { marginBottom: '2.5rem' },
  backBtn: { display: 'inline-block', color: '#4f46e5', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem' },
  pageTitle: { fontSize: '2.25rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem', letterSpacing: '-0.02em' },
  pageDesc: { color: '#6b7280', fontSize: '1.05rem', margin: 0 },

  emptyBox: { background: 'white', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', border: '1px dashed #cbd5e1' },
  emptyIcon: { fontSize: '4rem', marginBottom: '1.5rem' },
  emptyTitle: { fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.75rem', color: '#111827' },
  emptyText: { color: '#6b7280', margin: '0 auto', lineHeight: 1.6, maxWidth: '400px' },

  grid: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  card: { background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e5e7eb', transition: 'border-color 0.2s' },
  
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' },
  
  userInfo: { display: 'flex', gap: '1rem', alignItems: 'center' },
  avatar: { width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #a5b4fc, #818cf8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 },
  userName: { margin: '0 0 0.25rem', fontSize: '1.2rem', fontWeight: 700, color: '#111827' },
  userMetaRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  userEmail: { color: '#6b7280', fontSize: '0.9rem' },
  dateDot: { color: '#d1d5db', fontSize: '0.8rem' },
  date: { color: '#9ca3af', fontSize: '0.85rem' },

  statusBadge: { padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' },
  
  letterBox: { background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f1f5f9', position: 'relative' },
  letterText: { margin: 0, color: '#334155', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' },
  downloadResumeBtn: { background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },

  actions: { display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' },
  acceptBtn: { flex: 1, minWidth: '200px', padding: '0.875rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'opacity 0.2s', boxShadow: '0 4px 6px -1px rgba(16,185,129,0.3)' },
  rejectBtn: { flex: 1, minWidth: '200px', padding: '0.875rem', background: 'white', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
};