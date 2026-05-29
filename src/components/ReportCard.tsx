import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonText
} from '@ionic/react';
import { Report } from '../models/report';
import styles from './ReportCard.module.scss';

interface ReportCardProps {
  report: Report;
  onOpen: (reportId: string) => void;
}

const formatDate = (value: string) => new Date(value).toLocaleString();

const ReportCard: React.FC<ReportCardProps> = ({ report, onOpen }) => {
  const mediaEntry = report.sensorEntries.find((entry) => entry.mediaUrl);
  const hasMedia = Boolean(mediaEntry);
  const summary = report.sensorEntries[0]?.description;
  const summaryText = summary && summary.length > 120 ? `${summary.slice(0, 120)}...` : summary;

  return (
    <IonCard className={styles.card} onClick={() => onOpen(report.reportId)}>
      <div className={`${styles.media} ${hasMedia ? '' : styles.mediaEmpty}`}>
        {hasMedia ? 'Media captured' : 'No media preview'}
      </div>
      <IonCardHeader className={styles.header}>
        <IonCardSubtitle className={styles.subtitle}>
          {formatDate(report.createdAt)}
        </IonCardSubtitle>
        <IonCardTitle className={styles.title}>
          {report.title ?? 'Untitled Report'}
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent className={styles.content}>
        <IonChip color="primary">{report.observationType}</IonChip>
        {summaryText && <IonText className={styles.summary}>{summaryText}</IonText>}
        <IonText className={styles.meta}>
          {report.sensorEntries.length} sensor entries
        </IonText>
        <div className={styles.actions}>
          <IonButton
            fill="clear"
            onClick={(event) => {
              event.stopPropagation();
              onOpen(report.reportId);
            }}
          >
            Open report
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default ReportCard;
