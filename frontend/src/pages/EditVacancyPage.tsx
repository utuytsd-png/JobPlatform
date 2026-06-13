import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function EditVacancyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', company: '', location: '', salary: '', requiredSkills: '', employmentType: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/vacancies/${id}`).then(res => {
      const v = res.data;
      setForm({
        title: v.title || '',
        description: v.description || '',
        company: v.company || '',
        location: v.location || '',
        salary: v.salary || '',
        requiredSkills: v.requiredSkills || '',
        employmentType: v.employmentType || ''
      });
    })
    .finally(() => setInitLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/api/vacancies/${id}`, form);
      navigate(`/vacancies/${id}`);
    } catch {
      setError('Помилка при оновленні вакансії');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю вакансію? Дію неможливо скасувати.')) return;
    try {
      await api.delete(`/api/vacancies/${id}`);
      navigate('/vacancies');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Помилка при видаленні');
    }
  };

  if (initLoading) return (
    <div style={s.center}>
      <div style={s.spinner} />
      <p style={{ color: '#6b7280', marginTop: '1rem' }}>Завантажуємо дані...</p>
    </div>
  );

  return (
    <div style={s.container}>
      <div style={s.headerGroup}>
        <Link to={`/vacancies/${id}`} style={s.backBtn}>← Взад до вакансії</Link>
        <div style={s.titleRow}>
          <div>
            <h1 style={s.pageTitle}>Редагувати вакансію</h1>
            <p style={s.pageDesc}>Внесіть зміни та збережіть нові умови для кандидатів.</p>
          </div>
          <button style={s.deleteBtn} onClick={handleDelete}>
            <span style={{ fontSize: '1.2rem' }}>🗑</span> Видалити вакансію
          </button>
        </div>
      </div>

      <div style={s.card}>
        {error && <div style={s.errorBox}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.formGrid}>
            <div style={s.fieldFull}>
              <label style={s.label}>Назва посади <span>*</span></label>
              <input style={s.input} value={form.title}
                onChange={e => setForm({...form, title: e.target.value})} required />
            </div>

            <div style={s.field}>
              <label style={s.label}>Компанія <span>*</span></label>
              <input style={s.input} value={form.company}
                onChange={e => setForm({...form, company: e.target.value})} required />
            </div>
            
            <div style={s.field}>
              <label style={s.label}>Місто (або Remote) <span>*</span></label>
              <input style={s.input} value={form.location}
                onChange={e => setForm({...form, location: e.target.value})} required />
            </div>

            <div style={s.field}>
              <label style={s.label}>Зарплатна вилка</label>
              <input style={s.input} value={form.salary}
                onChange={e => setForm({...form, salary: e.target.value})} />
            </div>

            <div style={s.field}>
              <label style={s.label}>Тип зайнятості</label>
              <select style={s.input} value={form.employmentType}
                onChange={e => setForm({...form, employmentType: e.target.value})}>
                <option value="">Оберіть...</option>
                <option value="Повна зайнятість">Повна зайнятість</option>
                <option value="Часткова зайнятість">Часткова зайнятість</option>
                <option value="Remote">Remote</option>
                <option value="Стажування">Стажування</option>
              </select>
            </div>

            <div style={s.fieldFull}>
              <label style={s.label}>Необхідні навички</label>
              <p style={s.hint}>Розділіть навички комою (Пр: React, TypeScript, Node.js)</p>
              <input style={s.input} value={form.requiredSkills}
                onChange={e => setForm({...form, requiredSkills: e.target.value})} />
            </div>

            <div style={s.fieldFull}>
              <label style={s.label}>Опис вакансії <span>*</span></label>
              <textarea style={s.textarea} value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                required rows={8} />
            </div>
          </div>
          
          <div style={s.formFooter}>
            <button style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { padding: '3rem 1.5rem', maxWidth: '850px', margin: '0 auto' },
  center: { textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  
  headerGroup: { marginBottom: '2rem' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' },
  backBtn: { display: 'inline-block', color: '#4f46e5', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem' },
  pageTitle: { fontSize: '2.25rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem', letterSpacing: '-0.02em' },
  pageDesc: { color: '#6b7280', fontSize: '1.05rem', margin: 0 },
  deleteBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(220,38,38,0.1)' },

  card: { background: 'white', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)', border: '1px solid #e5e7eb' },
  
  errorBox: { background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '10px', marginBottom: '2rem', border: '1px solid #fecaca', fontSize: '0.95rem', fontWeight: 500 },

  form: { display: 'flex', flexDirection: 'column' },
  formGrid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '2rem' },
  
  field: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  fieldFull: { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  
  label: { fontWeight: 600, color: '#374151', fontSize: '0.95rem' },
  hint: { margin: '-0.25rem 0 0.25rem', color: '#9ca3af', fontSize: '0.85rem' },
  
  input: { width: '100%', padding: '0.875rem 1rem', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', color: '#111827', background: '#f9fafb' },
  textarea: { width: '100%', padding: '1rem', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', color: '#111827', background: '#f9fafb', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 },
  
  formFooter: { display: 'flex', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6' },
  submitBtn: { padding: '1rem 2.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 6px -1px rgba(16,185,129,0.3)' },
};
