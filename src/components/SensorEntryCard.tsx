import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonText
} from '@ionic/react';
import { SensorEntry } from '../models/report';
import styles from './SensorEntryCard.module.scss';

interface SensorEntryCardProps {
  entry: SensorEntry;
  onEdit?: (entry: SensorEntry) => void;
  onRemove?: (entry: SensorEntry) => void;
}

const formatSensorLabel = (sensorType: string) =>
  sensorType
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');

const SensorEntryCard: React.FC<SensorEntryCardProps> = ({ entry, onEdit, onRemove }) => {
  return (
    <IonCard className={styles.card}>
      <IonCardHeader>
        <IonCardSubtitle className={styles.subtitle}>
          {formatSensorLabel(entry.sensorType)}
        </IonCardSubtitle>
        <IonCardTitle className={styles.title}>
          {entry.dataLabel ?? 'Sensor capture'}
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {entry.dataValue && (
          <IonText className={styles.value}>{entry.dataValue}</IonText>
        )}
        {entry.description && (
          <IonText className={styles.description}>{entry.description}</IonText>
        )}
        <div className={styles.actions}>
          {onEdit && (
            <IonButton size="small" fill="outline" onClick={() => onEdit(entry)}>
              Edit
            </IonButton>
          )}
          {onRemove && (
            <IonButton size="small" fill="clear" color="danger" onClick={() => onRemove(entry)}>
              Remove
            </IonButton>
          )}
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default SensorEntryCard;
