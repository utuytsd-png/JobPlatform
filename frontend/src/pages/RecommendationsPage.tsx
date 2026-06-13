import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface RecommendedVacancy {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  employmentType: string;
  description: string;
  matchScore: number;         // Процент совпадения
  matchedSkills: string[];    // Совпавшие навыки
}

export default function RecommendationsPage() {
  const [vacancies, setVacancies] = useState<RecommendedVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/api/recommendations');
      setVacancies(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не вдалося завантажити рекомендації');
    } finally {
      setLoading(false);
    }
  };

  // Функция для покраски бейджа процентов (зеленый для > 80%, желтый для > 50%, красный для остальных)
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: '#dcfce7', text: '#166534' }; // Зеленый
    if (score >= 50) return { bg: '#fef08a', text: '#854d0e' }; // Желтый
    return { bg: '#fee2e2', text: '#991b1b' }; // Красный
  };

  if (loading) return <div style={styles.center}>Аналізуємо ваші навички... ⏳</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Ваші Рекомендації 🎯</h1>
        <p style={styles.subtitle}>Ми підібрали ці вакансії на основі навичок з вашого профілю.</p>
      </div>

      {error ? (
        <div style={styles.error}>{error}</div>
      ) : vacancies.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>Немає рекомендацій 😔</h3>
          <p>Спробуйте додати більше навичок (наприклад: React, Java, SQL) у свій <Link to="/profile">Профіль</Link>, щоб система змогла знайти вам роботу.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {vacancies.map((vacancy) => {
            const colors = getScoreColor(vacancy.matchScore);
            return (
              <div key={vacancy.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.jobTitle}>{vacancy.title}</h3>
                  {/* Красивый бейдж процента совпадения */}
                  <span style={{ 
                    ...styles.scoreBadge, 
                    backgroundColor: colors.bg, 
                    color: colors.text 
                  }}>
                    {vacancy.matchScore}% Збіг
                  </span>
                </div>
                
                <div style={styles.companyInfo}>
                  <strong>🏢 {vacancy.company}</strong> • 📍 {vacancy.location || 'Віддалено'}
                </div>
                
                <div style={styles.skillsSection}>
                  <span style={styles.skillsLabel}>Збіг навичок:</span>
                  <div style={styles.skills}>
                    {vacancy.matchedSkills.map((skill, i) => (
                      <span key={i} style={styles.skillTag}>✅ {skill}</span>
                    ))}
                  </div>
                </div>

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
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '3rem' },
  title: { fontSize: '2.5rem', color: '#111827', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '1.1rem', color: '#6b7280', margin: 0 },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
  jobTitle: { margin: 0, fontSize: '1.25rem', color: '#1f2937', paddingRight: '10px' },
  
  scoreBadge: { padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 'bold', whiteSpace: 'nowrap' },
  companyInfo: { color: '#4b5563', fontSize: '0.9rem', marginBottom: '1rem' },
  
  skillsSection: { background: '#f9fafb', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
  skillsLabel: { fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  skillTag: { background: '#fff', border: '1px solid #e5e7eb', color: '#374151', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500 },
  
  description: { color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem', flex: 1 },
  
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' },
  salaryBadge: { background: '#f3f4f6', color: '#1f2937', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500 },
  detailsBtn: { background: '#4f46e5', color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, transition: 'background 0.2s' },
  
  center: { textAlign: 'center', marginTop: '3rem', fontSize: '1.2rem', color: '#6b7280' },
  error: { textAlign: 'center', background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' },
  emptyState: { textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db', maxWidth: '600px', margin: '0 auto' }
};