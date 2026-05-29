import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonNote
} from '@ionic/react';
import { addCircleOutline, gridOutline, logOutOutline, mapOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './AppMenu.module.scss';

const AppMenu: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAuthRoute =
    location.pathname.startsWith('/login') || location.pathname.startsWith('/register');
  const dashboardActive = location.pathname.startsWith('/app/dashboard');
  const ecoMapActive = location.pathname.startsWith('/app/eco-map');
  const createActive = location.pathname.startsWith('/app/reports/new');

  return (
    <IonMenu contentId="main-content" disabled={isAuthRoute} type="overlay">
      <IonContent>
        <div className={styles.menuHeader}>
          <div className={styles.menuBrand}>EcoScore 🌿</div>
          <IonNote>{user?.email ?? 'Sign in to continue 🌱'}</IonNote>
        </div>
        <IonList className={styles.menuList}>
          <IonMenuToggle autoHide={false}>
            <IonItem
              routerLink="/app/dashboard"
              routerDirection="root"
              detail={false}
              className={`${styles.menuItem} ${dashboardActive ? styles.menuItemSelected : ''}`}
            >
              <IonIcon slot="start" icon={gridOutline} />
              <IonLabel>EcoReports 🌿</IonLabel>
            </IonItem>
          </IonMenuToggle>
          <IonMenuToggle autoHide={false}>
            <IonItem
              routerLink="/app/eco-map"
              routerDirection="forward"
              detail={false}
              className={`${styles.menuItem} ${ecoMapActive ? styles.menuItemSelected : ''}`}
            >
              <IonIcon slot="start" icon={mapOutline} />
              <IonLabel>Eco Map 🗺️</IonLabel>
            </IonItem>
          </IonMenuToggle>
          <IonMenuToggle autoHide={false}>
            <IonItem
              routerLink="/app/reports/new"
              routerDirection="forward"
              detail={false}
              className={`${styles.menuItem} ${createActive ? styles.menuItemSelected : ''}`}
            >
              <IonIcon slot="start" icon={addCircleOutline} />
              <IonLabel>Create Report ✍️</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
        <div className={styles.menuFooter}>
          <IonButton expand="block" fill="outline" onClick={logout}>
            <IonIcon slot="start" icon={logOutOutline} />
            Logout 👋
          </IonButton>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default AppMenu;
