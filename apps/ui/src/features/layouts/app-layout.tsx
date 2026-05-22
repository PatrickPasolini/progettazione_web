import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../auth/auth.api';
import styles from '../css/books.module.css';

export function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navBrand} onClick={() => navigate('/')}>
          Gestione Appelli
        </div>

        <div className={styles.navLinks}>
          <div className={styles.userSection}>
            <button
              className={styles.userButton}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className={styles.userName}>
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email ?? 'Utente'}
              </span>
              ▾
            </button>

            {menuOpen && (
              <div className={styles.dropdownMenu}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => navigate('/logout')}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
}
