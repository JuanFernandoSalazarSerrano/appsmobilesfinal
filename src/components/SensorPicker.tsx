import {
  IonCheckbox,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonText
} from '@ionic/react';
import {
  cameraOutline,
  compassOutline,
  flashOutline,
  locateOutline,
  micOutline,
  pulseOutline,
  speedometerOutline,
  timerOutline,
  wifiOutline,
  batteryChargingOutline
} from 'ionicons/icons';
import { sensorOptions } from '../helpers/sensors';
import { SensorType } from '../models/report';
import styles from './SensorPicker.module.scss';

interface SensorPickerProps {
  selected: SensorType[];
  available: Record<SensorType, boolean>;
  onToggle: (sensorType: SensorType, next: boolean) => void;
}

const iconMap: Record<SensorType, string> = {
  camera: cameraOutline,
  microphone: micOutline,
  gps: locateOutline,
  'ambient-light': flashOutline,
  accelerometer: pulseOutline,
  gyroscope: speedometerOutline,
  magnetometer: compassOutline,
  barometer: speedometerOutline,
  battery: batteryChargingOutline,
  timestamp: timerOutline,
  network: wifiOutline
};

const SensorPicker: React.FC<SensorPickerProps> = ({ selected, available, onToggle }) => {
  return (
    <IonList className={styles.list}>
      {sensorOptions.map((option) => {
        const isChecked = selected.includes(option.type);
        const isAvailable = available[option.type];
        const isUnavailable = !isAvailable;

        return (
          <IonItem
            key={option.type}
            lines="none"
            className={`${styles.item} ${isUnavailable ? styles.itemDisabled : ''}`}
          >
            <IonCheckbox
              slot="start"
              checked={isChecked}
              disabled={isUnavailable}
              onIonChange={(event) => onToggle(option.type, event.detail.checked)}
            />
            <IonIcon slot="start" icon={iconMap[option.type]} />
            <IonLabel className={styles.label}>
              <h3>{option.label}</h3>
              <p>{option.description}</p>
            </IonLabel>
            <IonText slot="end" className={styles.category}>
              {option.category}
            </IonText>
          </IonItem>
        );
      })}
    </IonList>
  );
};

export default SensorPicker;
