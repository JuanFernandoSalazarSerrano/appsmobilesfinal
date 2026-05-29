import { IonButton, IonCard, IonCardContent, IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ReportCard from '../components/ReportCard';
import { useReports } from '../hooks/useReports';
import AppHeader from '../shared/AppHeader';
import natureImage from '../theme/natureimage.jpg';
import styles from './Dashboard.module.scss';

const Dashboard: React.FC = () => {
  const { reports } = useReports();
  const history = useHistory();
  const hasReports = reports.length > 0;

  const openReport = (reportId: string) => {
    history.push(`/app/report/${reportId}`);
  };

  return (
    <IonPage>
      <AppHeader title="EcoReports 🌿" />
      <IonContent className={`eco-content ${styles.content}`}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Your observations 🌎</h2>
            <p className={styles.subtitle}>
              Track environmental evidence captured across sensors and sessions 🌱
            </p>
          </div>
          <IonButton routerLink="/app/reports/new">Create report ➕</IonButton>
        </div>
        {hasReports ? (
          <>
            <IonCard className={styles.dailyCard}>
              <IonCardContent className={styles.dailyContent}>
                <div className={styles.dailyCopy}>
                  <span className={styles.dailyLabel}>Our world daily image 🌄</span>
                  <p className={styles.dailySubtitle}>
                    A quick visual check-in from the field archive.
                  </p>
                </div>
                <img
                  className={styles.dailyImage}
                  src={natureImage}
                  alt="A nature scene for the dashboard daily image"
                />
              </IonCardContent>
            </IonCard>
            <div className={styles.grid}>
              {reports.map((report) => (
                <ReportCard key={report.reportId} report={report} onOpen={openReport} />
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <EmptyState
              title="No reports found"
              message="Create your first ecological report to start logging evidence."
              actionLabel="Create report"
              onAction={() => history.push('/app/reports/new')}
              illustrationSrc={natureImage}
              illustrationTitle="Our world daily image"
              illustrationAlt="A nature scene for the dashboard empty state"
            />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
