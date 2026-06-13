import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface Vacancy {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  employmentType: string;
  description: string;
  requiredSkills: string;
}

export default function SavedVacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedVacancies();
  }, []);

  const fetchSavedVacancies = async () => {
    try {
      const res = await api.get('/api/saved-vacancies');
      setVacancies(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedVacancy = async (id: number) => {
    try {
      await api.post(`/api/saved-vacancies/${id}`);
      setVacancies(vacancies.filter(v => v.id !== id));
    } catch (e) {
      alert("Помилка видалення");
    }
  }

  if (loading) return <div style={styles.center}>Завантажуємо збережені вакансії... ⏳</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Збережені вакансії 💛</h1>
        <p style={styles.subtitle}>Вакансії, які ви зберегли для подальшого перегляду.</p>
      </div>

      {vacancies.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>Немає збережених вакансій 😔</h3>
          <p>Перейдіть до списку <Link to="/vacancies">всіх вакансій</Link>, щоб знайти та зберегти цікаві пропозиції.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {vacancies.map((vacancy) => (
            <div key={vacancy.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.jobTitle}>{vacancy.title}</h3>
                <button 
                  onClick={() => removeSavedVacancy(vacancy.id)}
                  style={styles.heartBtn}
                  title="Видалити зі збережених"
                >
                  💔
                </button>
              </div>
              
              <div style={styles.companyInfo}>
                <strong>🏢 {vacancy.company}</strong> • 📍 {vacancy.location || 'Віддалено'}
              </div>
              
              {vacancy.requiredSkills && (
                <div style={styles.skillsSection}>
                  <div style={styles.skills}>
                    {vacancy.requiredSkills.split(',').map((skill, i) => (
                      <span key={i} style={styles.skillTag}>{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <p style={styles.description}>
                {vacancy.description.length > 120 
                  ? vacancy.description.substring(0, 120) + '...' 
                  : vacancy.description}
              </p>

              <div style={styles.cardFooter}>
                <span style={styles.salaryBadge}>{vacancy.salary || 'Договірна'}</span>
                <Link to={`/vacancies/${vacancy.id}`} style={styles.detailsBtn}>
                  Детальніше
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 4rem)', background: '#f8fafc' },
  header: { textAlign: 'center', marginBottom: '3rem' },
  title: { fontSize: '2.5rem', color: '#111827', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '1.1rem', color: '#6b7280', margin: 0 },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
  jobTitle: { margin: 0, fontSize: '1.25rem', color: '#1f2937', paddingRight: '10px' },
  heartBtn: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 5px' },

  companyInfo: { color: '#4b5563', fontSize: '0.9rem', marginBottom: '1rem' },
  
  skillsSection: { marginBottom: '1rem' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  skillTag: { background: '#eef2ff', color: '#4f46e5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500 },
  
  description: { color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem', flex: 1 },
  
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' },
  salaryBadge: { background: '#f0fdf4', color: '#15803d', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, border: '1px solid #bbf7d0' },
  detailsBtn: { background: '#4f46e5', color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, transition: 'background 0.2s' },
  
  center: { textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: '#6b7280', minHeight: '60vh' },
  emptyState: { textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db', maxWidth: '600px', margin: '0 auto' }
};
