import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Profile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  skills: string; 
  experience: string;
  education: string;
  resumeText: string;
  resumeFilePath?: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const [form, setForm] = useState({
    firstName: '', lastName: '', 
    experience: '', education: '', resumeText: ''
  });
  
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    api.get('/api/profile')
      .then(res => {
        const data = res.data;
        setProfile(data);
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          experience: data.experience || '',
          education: data.education || '',
          resumeText: data.resumeText || ''
        });
        if (data.skills) {
          setSkillsList(data.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
        }
      })
      .catch(err => {
        setMessage({ text: 'Помилка завантаження профілю', type: 'error' });
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skillsList.includes(skillInput.trim())) {
        setSkillsList([...skillsList, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter(skill => skill !== skillToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        skills: skillsList.join(', ')
      };
      
      await api.put('/api/profile', payload);
      setMessage({ text: 'Профіль успішно оновлено!', type: 'success' });
    } catch {
      setMessage({ text: 'Помилка при збереженні', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    try {
      await api.post('/api/profile/resume/file', formData);
      setMessage({ text: 'Файл резюме успішно завантажено', type: 'success' });
      setProfile(prev => prev ? { ...prev, resumeFilePath: file.name } : null);
    } catch (err) {
      setMessage({ text: 'Помилка завантаження файлу', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleFileDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await api.get('/api/profile/resume/file', { responseType: 'blob' });
      const disposition = res.headers['content-disposition'];
      let filename = profile?.resumeFilePath || 'resume.file';
      if (disposition) {
        const mx = disposition.match(/filename="?([^"]+)"?/);
        if (mx && mx.length === 2) filename = mx[1];
      }
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Помилка завантаження файлу');
    }
  };

  const handleDeleteFile = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Ви впевнені, що хочете видалити резюме?')) return;
    try {
      await api.delete('/api/profile/resume/file');
      setMessage({ text: 'Файл резюме успішно видалено', type: 'success' });
      setProfile(prev => prev ? { ...prev, resumeFilePath: null } : null);
    } catch (err) {
      setMessage({ text: 'Помилка видалення файлу', type: 'error' });
    }
  };

  if (loading) return (
    <div style={s.center}>
      <div style={s.spinner} />
      <p style={{ color: '#6b7280', marginTop: '1rem' }}>Завантажуємо профіль...</p>
    </div>
  );

  const isCandidate = user?.role === 'JOB_SEEKER' || profile?.role === 'JOB_SEEKER';

  return (
    <div style={s.container}>
      <div style={s.headerWrap}>
        <div style={s.headerInner}>
          <div style={s.avatarLg}>
             {profile?.firstName?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 style={s.title}>{form.firstName} {form.lastName}</h1>
            <div style={s.headerBadges}>
              <span style={s.emailBadge}>📧 {profile?.email}</span>
              <span style={s.roleBadge}>
                {profile?.role === 'EMPLOYER' ? '🏢 Роботодавець' : '👤 Шукач роботи'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <h2 style={s.sectionTitle}>Особиста інформація</h2>
          <p style={s.sectionDesc}>Оновіть ваші дані, щоб роботодавці могли дізнатись про вас більше.</p>
        </div>

        {message && (
          <div style={message.type === 'success' ? s.success : s.error}>
            {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
          </div>
        )}

        <form onSubmit={handleSave} style={s.form}>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Ім'я</label>
              <input style={s.input} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Прізвище</label>
              <input style={s.input} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required />
            </div>
          </div>

          {isCandidate && (
            <>
              <div style={s.field}>
                <label style={s.label}>Навички</label>
                <p style={s.hint}>Введіть навичку та натисніть Enter</p>
                <div style={s.skillsContainer}>
                  {skillsList.map(skill => (
                    <span key={skill} style={s.skillBadge}>
                      {skill} 
                      <button type="button" onClick={() => removeSkill(skill)} style={s.removeSkillBtn}>&times;</button>
                    </span>
                  ))}
                  <input 
                    style={s.skillInput} 
                    value={skillInput} 
                    onChange={e => setSkillInput(e.target.value)} 
                    onKeyDown={handleAddSkill} 
                    placeholder="Наприклад: React, Kotlin, SQL..." 
                  />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Досвід роботи</label>
                <textarea style={s.textarea} value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} rows={4} placeholder="Опишіть ваш попередній досвід роботи, обов'язки та досягнення..."/>
              </div>

              <div style={s.field}>
                <label style={s.label}>Освіта</label>
                <textarea style={s.textarea} value={form.education} onChange={e => setForm({...form, education: e.target.value})} rows={2} placeholder="Навчальний заклад, ступінь, спеціальність, роки навчання..."/>
              </div>

              <div style={s.field}>
                <label style={s.label}>Про себе (Текстове резюме)</label>
                <textarea style={s.textarea} value={form.resumeText} onChange={e => setForm({...form, resumeText: e.target.value})} rows={5} placeholder="Коротко розкажіть про свої сильні сторони, цілі та мотивацію..."/>
              </div>

              <div style={s.field}>
                <label style={s.label}>Файл резюме (PDF, DOCX)</label>
                {profile?.resumeFilePath && (
                   <div style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                     ✅ Завантажено файл: 
                     <button onClick={handleFileDownload} style={s.downloadBtn}>
                       {profile.resumeFilePath}
                     </button>
                     <button onClick={handleDeleteFile} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>
                       Видалити 🗑️
                     </button>
                   </div>
                )}
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload} 
                  style={s.fileInput} 
                  disabled={uploading}
                />
                {uploading && <span style={{fontSize: '0.85rem', color: '#6b7280'}}>Завантаження файлу...⏳</span>}
              </div>
            </>
          )}

          <div style={s.submitRow}>
             <button type="submit" style={{ ...s.button, opacity: saving ? 0.7 : 1 }} disabled={saving}>
              {saving ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { padding: '2rem 1.5rem', maxWidth: '850px', margin: '0 auto' },
  center: { textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  
  headerWrap: { marginBottom: '2rem' },
  headerInner: { display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' },
  avatarLg: { width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #a5b4fc, #818cf8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, flexShrink: 0, boxShadow: '0 4px 12px rgba(129, 140, 248, 0.4)' },
  title: { margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' },
  headerBadges: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  emailBadge: { background: '#f3f4f6', color: '#4b5563', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500 },
  roleBadge: { background: '#eef2ff', color: '#4f46e5', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600 },

  card: { background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb' },
  cardHeader: { marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' },
  sectionTitle: { margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#111827' },
  sectionDesc: { margin: 0, color: '#6b7280', fontSize: '0.95rem' },

  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontWeight: 600, color: '#374151', fontSize: '0.9rem' },
  hint: { margin: '-0.25rem 0 0', color: '#9ca3af', fontSize: '0.8rem' },
  
  input: { width: '100%', padding: '0.875rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', color: '#111827' },
  textarea: { width: '100%', padding: '0.875rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', color: '#111827', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 },
  
  skillsContainer: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '48px', alignItems: 'center', transition: 'border-color 0.2s' },
  skillBadge: { background: '#eef2ff', color: '#4f46e5', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #c7d2fe' },
  removeSkillBtn: { background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '1.1rem', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  skillInput: { border: 'none', outline: 'none', flex: 1, minWidth: '150px', fontSize: '0.95rem', padding: '0.25rem', color: '#111827', background: 'transparent' },
  
  submitRow: { marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' },
  button: { background: '#4f46e5', color: 'white', border: 'none', padding: '0.875rem 2rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)' },
  
  fileInput: { width: '100%', padding: '0.5rem', border: '1px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', color: '#4b5563', fontSize: '0.9rem' },
  downloadBtn: { background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontWeight: 600, fontSize: '0.9rem' },

  success: { background: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #a7f3d0', fontSize: '0.95rem', fontWeight: 500 },
  error: { background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fecaca', fontSize: '0.95rem', fontWeight: 500 }
};
