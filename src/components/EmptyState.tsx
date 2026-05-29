import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonText
} from '@ionic/react';
import { leafOutline } from 'ionicons/icons';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  illustrationSrc?: string;
  illustrationTitle?: string;
  illustrationAlt?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  illustrationSrc,
  illustrationTitle,
  illustrationAlt
}) => {
  return (
    <IonCard className={styles.card}>
      <IonCardHeader>
        <IonCardTitle>{title}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent className={styles.content}>
        <div className={styles.copy}>
          <div className={styles.iconWrap}>
            <IonIcon icon={leafOutline} />
          </div>
          <IonText className={styles.message}>{message}</IonText>
          <IonButton expand="block" className={styles.action} onClick={onAction}>
            {actionLabel}
          </IonButton>
        </div>
        {illustrationSrc ? (
          <figure className={styles.illustration}>
            <figcaption className={styles.illustrationTitle}>
              {illustrationTitle ?? 'Illustration'}
            </figcaption>
            <img
              className={styles.image}
              src={illustrationSrc}
              alt={illustrationAlt ?? illustrationTitle ?? title}
            />
          </figure>
        ) : null}
      </IonCardContent>
    </IonCard>
  );
};

export default EmptyState;
