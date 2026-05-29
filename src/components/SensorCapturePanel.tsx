import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonTextarea
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Device } from '@capacitor/device';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createId } from '../helpers/ids';
import { SensorEntry, SensorType } from '../models/report';
import styles from './SensorCapturePanel.module.scss';

interface SensorCapturePanelProps {
  sensorType: SensorType;
  onSave: (entry: SensorEntry) => void;
  initialEntry?: SensorEntry | null;
}

const SensorCapturePanel: React.FC<SensorCapturePanelProps> = ({
  sensorType,
  onSave,
  initialEntry
}) => {
  const [description, setDescription] = useState('');
  const [dataLabel, setDataLabel] = useState('');
  const [dataValue, setDataValue] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLng, setGpsLng] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState('');
  const [captureError, setCaptureError] = useState('');
  const mediaObjectUrlRef = useRef<string | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<number | null>(null);

  const updateMediaUrl = (nextUrl: string) => {
    if (mediaObjectUrlRef.current) {
      URL.revokeObjectURL(mediaObjectUrlRef.current);
      mediaObjectUrlRef.current = null;
    }
    if (nextUrl.startsWith('blob:')) {
      mediaObjectUrlRef.current = nextUrl;
    }
    setMediaUrl(nextUrl);
  };

  const startCapture = (status: string) => {
    setIsCapturing(true);
    setCaptureStatus(status);
    setCaptureError('');
  };

  const finishCapture = () => {
    setIsCapturing(false);
    setCaptureStatus('');
  };

  const handleCaptureError = (error: unknown, message: string) => {
    console.error(message, error);
    setCaptureError(message);
  };

  const clearCaptureFeedback = () => {
    setCaptureError('');
    setCaptureStatus('');
  };

  useEffect(() => {
    if (initialEntry) {
      setDescription(initialEntry.description ?? '');
      setDataLabel(initialEntry.dataLabel ?? '');
      setDataValue(initialEntry.dataValue ?? '');
      updateMediaUrl(initialEntry.mediaUrl ?? '');
      if (initialEntry.sensorType === 'gps' && initialEntry.dataValue) {
        const [lat, lng] = initialEntry.dataValue.split(',').map((value) => value.trim());
        setGpsLat(lat ?? '');
        setGpsLng(lng ?? '');
      }
      setCaptureError('');
      setCaptureStatus('');
      setIsCapturing(false);
      return;
    }

    setDescription('');
    setDataLabel('');
    setDataValue('');
    updateMediaUrl('');
    setGpsLat('');
    setGpsLng('');
    setCaptureError('');
    setCaptureStatus('');
    setIsCapturing(false);
  }, [initialEntry, sensorType]);

  useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current) {
        window.clearTimeout(recordingTimeoutRef.current);
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (mediaObjectUrlRef.current) {
        URL.revokeObjectURL(mediaObjectUrlRef.current);
      }
    };
  }, []);

  const setMockMedia = () => {
    clearCaptureFeedback();
    updateMediaUrl(`mock://${sensorType}/${createId()}`);
    setDataLabel(sensorType === 'camera' ? 'Photo capture' : 'Audio clip');
  };

  const captureMedia = async () => {
    if (sensorType === 'camera') {
      startCapture('Capturing photo...');
      try {
        const photo = await Camera.getPhoto({
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
          quality: 80
        });
        const mediaPath = photo.webPath ?? photo.path ?? '';
        if (!mediaPath) {
          handleCaptureError(null, 'No photo was captured.');
          return;
        }
        updateMediaUrl(mediaPath);
        setDataLabel('Photo capture');
      } catch (error) {
        handleCaptureError(error, 'Unable to access the camera on this device.');
      } finally {
        finishCapture();
      }
      return;
    }

    startCapture('Recording audio...');
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        handleCaptureError(null, 'Audio recording is not supported on this device.');
        finishCapture();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: recorder.mimeType || 'audio/webm'
        });
        const audioUrl = URL.createObjectURL(blob);
        updateMediaUrl(audioUrl);
        setDataLabel('Audio clip');
        stream.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
        if (recordingTimeoutRef.current) {
          window.clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
        finishCapture();
      };

      recorder.start();
      recordingTimeoutRef.current = window.setTimeout(() => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, 4000);
    } catch (error) {
      handleCaptureError(error, 'Unable to record audio on this device.');
      finishCapture();
    }
  };

  const setMockBattery = () => {
    clearCaptureFeedback();
    setDataValue('83%');
    setDataLabel('Battery level');
  };

  const captureBattery = async () => {
    startCapture('Reading battery status...');
    try {
      const info = await Device.getBatteryInfo();
      if (info.batteryLevel == null) {
        handleCaptureError(null, 'Battery information is unavailable.');
        return;
      }
      const percentage = Math.round(info.batteryLevel * 100);
      const charging = info.isCharging ? ' (charging)' : '';
      setDataValue(`${percentage}%${charging}`);
      setDataLabel('Battery level');
    } catch (error) {
      handleCaptureError(error, 'Unable to read battery status.');
    } finally {
      finishCapture();
    }
  };

  const setMockNetwork = () => {
    clearCaptureFeedback();
    setDataValue('Wi-Fi');
    setDataLabel('Network status');
  };

  const captureNetwork = async () => {
    startCapture('Checking network status...');
    try {
      const status = await Network.getStatus();
      const connectionType = status.connectionType ?? 'unknown';
      const connectionLabel =
        connectionType === 'wifi'
          ? 'Wi-Fi'
          : connectionType === 'cellular'
            ? 'Cellular'
            : connectionType === 'none'
              ? 'Offline'
              : connectionType;
      const connectionState = status.connected ? 'connected' : 'disconnected';
      setDataValue(`${connectionLabel} (${connectionState})`);
      setDataLabel('Network status');
    } catch (error) {
      handleCaptureError(error, 'Unable to read network status.');
    } finally {
      finishCapture();
    }
  };

  const setMockTimestamp = () => {
    clearCaptureFeedback();
    setDataValue(new Date().toISOString());
    setDataLabel('Captured time');
  };

  const captureTimestamp = () => {
    clearCaptureFeedback();
    setDataValue(new Date().toISOString());
    setDataLabel('Captured time');
  };

  const setMockCoordinates = () => {
    clearCaptureFeedback();
    setGpsLat('37.7739');
    setGpsLng('-122.4312');
    setDataLabel('Coordinates');
  };

  const captureCoordinates = async () => {
    startCapture('Fetching GPS coordinates...');
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });
      setGpsLat(position.coords.latitude.toFixed(5));
      setGpsLng(position.coords.longitude.toFixed(5));
      setDataLabel('Coordinates');
    } catch (error) {
      handleCaptureError(error, 'Unable to access GPS on this device.');
    } finally {
      finishCapture();
    }
  };

  const formatNumber = (value: number | null | undefined, digits = 2) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return null;
    }
    return value.toFixed(digits);
  };

  const formatVector = (
    x: number | null | undefined,
    y: number | null | undefined,
    z: number | null | undefined
  ) => {
    const fx = formatNumber(x);
    const fy = formatNumber(y);
    const fz = formatNumber(z);
    if (!fx || !fy || !fz) {
      return null;
    }
    return `x ${fx}, y ${fy}, z ${fz}`;
  };

  const readGenericSensorOnce = (
    sensorClassName: string,
    buildReading: (sensor: any) => { value: string; label: string } | null
  ) => {
    const SensorClass = (window as typeof window & Record<string, any>)[
      sensorClassName
    ];
    if (!SensorClass) {
      return Promise.resolve(null);
    }

    return new Promise<{ value: string; label: string } | null>((resolve, reject) => {
      let settled = false;
      const sensor = new SensorClass({ frequency: 1 });

      const cleanup = () => {
        sensor.removeEventListener('reading', onReading);
        sensor.removeEventListener('error', onError);
        sensor.stop();
      };

      const onReading = () => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        resolve(buildReading(sensor));
      };

      const onError = (event: any) => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        reject(event?.error ?? new Error('Sensor error'));
      };

      sensor.addEventListener('reading', onReading);
      sensor.addEventListener('error', onError);
      sensor.start();

      window.setTimeout(() => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        resolve(null);
      }, 1500);
    });
  };

  const readDeviceMotionAcceleration = () => {
    if (typeof DeviceMotionEvent === 'undefined') {
      return Promise.resolve(null);
    }
    return new Promise<{ value: string; label: string } | null>((resolve) => {
      let settled = false;
      const handler = (event: DeviceMotionEvent) => {
        if (settled) {
          return;
        }
        const acceleration =
          event.accelerationIncludingGravity ?? event.acceleration ?? null;
        const value = acceleration
          ? formatVector(acceleration.x, acceleration.y, acceleration.z)
          : null;
        settled = true;
        window.removeEventListener('devicemotion', handler);
        resolve(value ? { value, label: 'm/s^2' } : null);
      };

      window.addEventListener('devicemotion', handler, { once: true });
      window.setTimeout(() => {
        if (settled) {
          return;
        }
        settled = true;
        window.removeEventListener('devicemotion', handler);
        resolve(null);
      }, 1500);
    });
  };

  const readDeviceMotionRotation = () => {
    if (typeof DeviceMotionEvent === 'undefined') {
      return Promise.resolve(null);
    }
    return new Promise<{ value: string; label: string } | null>((resolve) => {
      let settled = false;
      const handler = (event: DeviceMotionEvent) => {
        if (settled) {
          return;
        }
        const rotation = event.rotationRate;
        const value = rotation
          ? formatVector(rotation.alpha, rotation.beta, rotation.gamma)
          : null;
        settled = true;
        window.removeEventListener('devicemotion', handler);
        resolve(value ? { value, label: 'rad/s' } : null);
      };

      window.addEventListener('devicemotion', handler, { once: true });
      window.setTimeout(() => {
        if (settled) {
          return;
        }
        settled = true;
        window.removeEventListener('devicemotion', handler);
        resolve(null);
      }, 1500);
    });
  };

  const readEnvironmentSensor = async () => {
    switch (sensorType) {
      case 'ambient-light':
        return readGenericSensorOnce('AmbientLightSensor', (sensor) => {
          const value = formatNumber(sensor.illuminance, 1);
          return value ? { value, label: 'Lux' } : null;
        });
      case 'accelerometer': {
        const reading = await readGenericSensorOnce('Accelerometer', (sensor) => {
          const value = formatVector(sensor.x, sensor.y, sensor.z);
          return value ? { value, label: 'm/s^2' } : null;
        });
        return reading ?? readDeviceMotionAcceleration();
      }
      case 'gyroscope': {
        const reading = await readGenericSensorOnce('Gyroscope', (sensor) => {
          const value = formatVector(sensor.x, sensor.y, sensor.z);
          return value ? { value, label: 'rad/s' } : null;
        });
        return reading ?? readDeviceMotionRotation();
      }
      case 'magnetometer':
        return readGenericSensorOnce('Magnetometer', (sensor) => {
          const value = formatVector(sensor.x, sensor.y, sensor.z);
          return value ? { value, label: 'uT' } : null;
        });
      case 'barometer':
        return readGenericSensorOnce('Barometer', (sensor) => {
          const value = formatNumber(sensor.pressure, 1);
          return value ? { value, label: 'hPa' } : null;
        });
      default:
        return Promise.resolve(null);
    }
  };

  const captureEnvironmentReading = async () => {
    startCapture('Reading sensor...');
    try {
      const reading = await readEnvironmentSensor();
      if (!reading) {
        handleCaptureError(
          null,
          'This sensor is not available in the current environment.'
        );
        return;
      }
      setDataValue(reading.value);
      setDataLabel(reading.label);
    } catch (error) {
      handleCaptureError(error, 'Unable to read the sensor on this device.');
    } finally {
      finishCapture();
    }
  };

  const requiresMedia = sensorType === 'camera' || sensorType === 'microphone';
  const canSave = description.trim().length > 0 && (!requiresMedia || mediaUrl);

  const panelTitle = useMemo(() => {
    const name = sensorType
      .split('-')
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ');
    return `${name} capture`;
  }, [sensorType]);

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    const finalValue = sensorType === 'gps' ? `${gpsLat}, ${gpsLng}` : dataValue;

    const entry: SensorEntry = {
      entryId: initialEntry?.entryId ?? createId(),
      sensorType,
      dataLabel: dataLabel || 'Sensor capture',
      dataValue: finalValue || undefined,
      mediaUrl: mediaUrl || undefined,
      description: description.trim(),
      timestamp: new Date().toISOString()
    };

    onSave(entry);
    setDescription('');
    setDataLabel('');
    setDataValue('');
    updateMediaUrl('');
    setGpsLat('');
    setGpsLng('');
  };

  const renderCaptureFeedback = () => {
    if (!captureStatus && !captureError) {
      return null;
    }

    return (
      <div className={styles.field}>
        {captureStatus && <IonText className={styles.hint}>{captureStatus}</IonText>}
        {captureError && (
          <IonText color="danger" className={styles.hint}>
            {captureError}
          </IonText>
        )}
      </div>
    );
  };

  const renderCaptureFields = () => {
    switch (sensorType) {
      case 'camera':
      case 'microphone':
        return (
          <div className={styles.field}>
            <div
              className={`${styles.preview} ${mediaUrl ? styles.previewReady : ''}`}
            >
              <IonText>
                {mediaUrl ? 'Preview ready' : 'No media captured yet'}
              </IonText>
            </div>
            <IonButton onClick={captureMedia} disabled={isCapturing}>
              {sensorType === 'camera' ? 'Capture photo' : 'Record audio (4s)'}
            </IonButton>
            <IonButton fill="outline" onClick={setMockMedia} disabled={isCapturing}>
              {sensorType === 'camera' ? 'Mock capture photo' : 'Mock capture audio'}
            </IonButton>
            {mediaUrl ? (
              <IonChip color="tertiary">Capture ready</IonChip>
            ) : (
              <IonText className={styles.hint}>Capture a sample to preview.</IonText>
            )}
          </div>
        );
      case 'gps':
        return (
          <div className={styles.field}>
            <div
              className={`${styles.preview} ${
                gpsLat && gpsLng ? styles.previewReady : ''
              }`}
            >
              <IonText>
                {gpsLat && gpsLng
                  ? `Lat ${gpsLat}, Lng ${gpsLng}`
                  : 'No coordinates captured yet'}
              </IonText>
            </div>
            <IonButton onClick={captureCoordinates} disabled={isCapturing}>
              Use current location
            </IonButton>
            <IonItem>
              <IonLabel position="stacked">Latitude</IonLabel>
              <IonInput
                value={gpsLat}
                placeholder="37.7739"
                onIonChange={(event) => setGpsLat(event.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Longitude</IonLabel>
              <IonInput
                value={gpsLng}
                placeholder="-122.4312"
                onIonChange={(event) => setGpsLng(event.detail.value ?? '')}
              />
            </IonItem>
            <IonButton fill="outline" onClick={setMockCoordinates} disabled={isCapturing}>
              Use mock coordinates
            </IonButton>
          </div>
        );
      case 'ambient-light':
      case 'accelerometer':
      case 'gyroscope':
      case 'magnetometer':
      case 'barometer':
        return (
          <div className={styles.field}>
            <IonButton fill="outline" onClick={captureEnvironmentReading} disabled={isCapturing}>
              Read from device
            </IonButton>
            <IonItem>
              <IonLabel position="stacked">Reading</IonLabel>
              <IonInput
                value={dataValue}
                placeholder="Enter sensor reading"
                onIonChange={(event) => setDataValue(event.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Units or context</IonLabel>
              <IonInput
                value={dataLabel}
                placeholder="Lux, m/s^2, or notes"
                onIonChange={(event) => setDataLabel(event.detail.value ?? '')}
              />
            </IonItem>
          </div>
        );
      case 'battery':
        return (
          <div className={styles.field}>
            <IonButton onClick={captureBattery} disabled={isCapturing}>
              Read battery status
            </IonButton>
            <IonButton fill="outline" onClick={setMockBattery} disabled={isCapturing}>
              Capture battery status
            </IonButton>
            {dataValue && <IonChip color="tertiary">{dataValue}</IonChip>}
          </div>
        );
      case 'network':
        return (
          <div className={styles.field}>
            <IonButton onClick={captureNetwork} disabled={isCapturing}>
              Read network status
            </IonButton>
            <IonButton fill="outline" onClick={setMockNetwork} disabled={isCapturing}>
              Capture network status
            </IonButton>
            {dataValue && <IonChip color="tertiary">{dataValue}</IonChip>}
          </div>
        );
      case 'timestamp':
        return (
          <div className={styles.field}>
            <IonButton onClick={captureTimestamp}>
              Capture device time
            </IonButton>
            <IonButton fill="outline" onClick={setMockTimestamp}>
              Capture timestamp
            </IonButton>
            {dataValue && (
              <IonChip color="tertiary">
                {new Date(dataValue).toLocaleString()}
              </IonChip>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <IonCard className={styles.panel}>
      <IonCardHeader>
        <IonCardTitle className={styles.title}>{panelTitle}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {renderCaptureFields()}
        {renderCaptureFeedback()}
        <IonItem lines="none">
          <IonLabel position="stacked">Context notes</IonLabel>
          <IonTextarea
            value={description}
            placeholder="Describe what the sensor captured"
            onIonChange={(event) => setDescription(event.detail.value ?? '')}
          />
        </IonItem>
        <IonButton expand="block" onClick={handleSave} disabled={!canSave}>
          {initialEntry ? 'Update entry' : 'Save entry'}
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default SensorCapturePanel;
