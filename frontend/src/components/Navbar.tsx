import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.left}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}>🚀</span>
            <Link to="/vacancies" style={styles.brandLink}>JobPlatform</Link>
          </div>

          <div style={styles.menuLinks}>
            <Link to="/vacancies" style={{ ...styles.link, ...(isActive('/vacancies') ? styles.linkActive : {}) }}>
              Вакансії
            </Link>

            {isAuthenticated && user?.role === 'JOB_SEEKER' && (
              <>
                <Link to="/saved-vacancies" style={{ ...styles.link, ...(isActive('/saved-vacancies') ? styles.linkActive : {}) }}>Збережені</Link>
                <Link to="/recommendations" style={{ ...styles.link, ...(isActive('/recommendations') ? styles.linkActive : {}) }}>Рекомендації</Link>
                <Link to="/my-applications" style={{ ...styles.link, ...(isActive('/my-applications') ? styles.linkActive : {}) }}>Мої відгуки</Link>
              </>
            )}

            {isAuthenticated && user?.role === 'EMPLOYER' && (
              <Link to="/vacancies/create" style={{ ...styles.link, ...(isActive('/vacancies/create') ? styles.linkActive : {}) }}>
                Додати вакансію
              </Link>
            )}

            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link to="/admin" style={{ ...styles.link, ...(isActive('/admin') ? styles.linkActive : {}) }}>
                Адмін панель
              </Link>
            )}
          </div>
        </div>

        <div style={styles.right}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" style={styles.loginBtn}>Увійти</Link>
              <Link to="/register" style={styles.registerBtn}>Реєстрація</Link>
            </>
          ) : (
            <div style={styles.userMenu}>
              <Link to="/profile" style={styles.profileLink}>
                <div style={styles.avatar}>
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={styles.userName}>{user?.firstName || user?.email}</span>
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Вийти</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: { 
    background: '#ffffff', 
    borderBottom: '1px solid #e5e7eb', 
    position: 'sticky', 
    top: 0, 
    zIndex: 50,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '0 1.5rem', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    height: '4rem' 
  },
  left: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '2.5rem' 
  },
  brand: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem' 
  },
  brandIcon: { 
    fontSize: '1.5rem' 
  },
  brandLink: { 
    textDecoration: 'none', 
    color: '#111827', 
    fontSize: '1.25rem', 
    fontWeight: 800,
    letterSpacing: '-0.025em'
  },
  menuLinks: { 
    display: 'flex', 
    gap: '1.5rem', 
    alignItems: 'center' 
  },
  link: { 
    textDecoration: 'none', 
    color: '#6b7280', 
    fontWeight: 500, 
    fontSize: '0.95rem',
    transition: 'color 0.2s',
    padding: '0.5rem 0'
  },
  linkActive: { 
    color: '#4f46e5', 
    fontWeight: 600,
    boxShadow: 'inset 0 -2px 0 0 #4f46e5'
  },
  right: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '1rem' 
  },
  loginBtn: { 
    textDecoration: 'none', 
    color: '#374151', 
    fontWeight: 600, 
    fontSize: '0.95rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    transition: 'background-color 0.2s'
  },
  registerBtn: { 
    textDecoration: 'none', 
    background: '#4f46e5', 
    color: '#ffffff', 
    fontWeight: 600, 
    fontSize: '0.95rem',
    padding: '0.5rem 1.25rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 2px 0 rgba(79, 70, 229, 0.5)',
    transition: 'background-color 0.2s'
  },
  userMenu: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '1.5rem' 
  },
  profileLink: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.75rem', 
    textDecoration: 'none' 
  },
  avatar: { 
    width: '36px', 
    height: '36px', 
    borderRadius: '50%', 
    background: 'linear-gradient(135deg, #a5b4fc, #818cf8)', 
    color: 'white', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: 700,
    fontSize: '1.1rem'
  },
  userName: { 
    color: '#111827', 
    fontWeight: 600, 
    fontSize: '0.95rem' 
  },
  logoutBtn: { 
    background: '#fee2e2', 
    color: '#b91c1c', 
    border: 'none', 
    padding: '0.4rem 0.85rem', 
    borderRadius: '0.5rem', 
    cursor: 'pointer', 
    fontWeight: 600,
    fontSize: '0.875rem',
    transition: 'background-color 0.2s'
  }
};