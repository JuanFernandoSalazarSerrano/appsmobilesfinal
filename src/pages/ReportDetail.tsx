import {
  IonButton,
  IonContent,
  IonPage,
  IonText
} from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import SensorEntryCard from '../components/SensorEntryCard';
import { useReports } from '../hooks/useReports';
import AppHeader from '../shared/AppHeader';
import styles from './ReportDetail.module.scss';

interface ReportDetailParams {
  reportId: string;
}

const ReportDetail: React.FC = () => {
  const { reportId } = useParams<ReportDetailParams>();
  const { getReportById } = useReports();
  const history = useHistory();
  const report = getReportById(reportId);

  if (!report) {
    return (
      <IonPage>
        <AppHeader title="Report not found 😕" />
        <IonContent className={`eco-content ${styles.content}`}>
          <IonText>We could not find that report.</IonText>
          <IonButton onClick={() => history.push('/app/dashboard')}>
            Back to dashboard ⬅️
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppHeader title={report.title ?? 'Report detail'} />
      <IonContent className={`eco-content ${styles.content}`}>
        <div className={styles.header}>
          <IonText className={styles.observation}>{report.observationType}</IonText>
          <IonText className={styles.meta}>
            {new Date(report.createdAt).toLocaleString()}
          </IonText>
        </div>
        <div className={styles.entries}>
          {report.sensorEntries.map((entry) => (
            <SensorEntryCard key={entry.entryId} entry={entry} />
          ))}
        </div>
        <IonButton
          expand="block"
          onClick={() => history.push(`/app/report/${reportId}/chat`)}
        >
          Open report chat 💬
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ReportDetail;
