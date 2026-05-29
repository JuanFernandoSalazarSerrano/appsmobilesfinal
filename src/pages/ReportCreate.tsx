import {
  IonButton,
  IonChip,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonText
} from '@ionic/react';
import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SensorCapturePanel from '../components/SensorCapturePanel';
import SensorEntryCard from '../components/SensorEntryCard';
import SensorPicker from '../components/SensorPicker';
import { defaultAvailableSensors, observationOptions } from '../helpers/sensors';
import { useAuth } from '../hooks/useAuth';
import { useReports } from '../hooks/useReports';
import { ObservationType, SensorEntry, SensorType } from '../models/report';
import AppHeader from '../shared/AppHeader';
import styles from './ReportCreate.module.scss';

type ReportStep = 'observation' | 'sensors' | 'capture' | 'summary';

const stepOrder: ReportStep[] = ['observation', 'sensors', 'capture', 'summary'];

const ReportCreate: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { createReport } = useReports();
  const [step, setStep] = useState<ReportStep>('observation');
  const [observationType, setObservationType] = useState<ObservationType | null>(null);
  const [selectedSensors, setSelectedSensors] = useState<SensorType[]>([]);
  const [activeSensor, setActiveSensor] = useState<SensorType | null>(null);
  const [entries, setEntries] = useState<SensorEntry[]>([]);
  const [title, setTitle] = useState('');
  const [editingEntry, setEditingEntry] = useState<SensorEntry | null>(null);

  const availableSensors = defaultAvailableSensors;

  useEffect(() => {
    if (!activeSensor && selectedSensors.length > 0) {
      setActiveSensor(selectedSensors[0]);
    }

    if (activeSensor && !selectedSensors.includes(activeSensor)) {
      setActiveSensor(selectedSensors[0] ?? null);
    }
  }, [activeSensor, selectedSensors]);

  const stepIndex = stepOrder.indexOf(step);

  const canGoToSensors = observationType !== null;
  const canGoToCapture = canGoToSensors && selectedSensors.length > 0;
  const canGoToSummary = canGoToCapture && entries.length > 0;

  const stepProgress = (stepIndex + 1) / stepOrder.length;

  const handleSensorToggle = (sensorType: SensorType, next: boolean) => {
    if (!availableSensors[sensorType]) {
      return;
    }

    setSelectedSensors((prev) =>
      next ? [...prev, sensorType] : prev.filter((sensor) => sensor !== sensorType)
    );
  };

  const handleSaveEntry = (entry: SensorEntry) => {
    setEntries((prev) => {
      const index = prev.findIndex((item) => item.entryId === entry.entryId);
      if (index >= 0) {
        const next = [...prev];
        next[index] = entry;
        return next;
      }
      return [entry, ...prev];
    });
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: SensorEntry) => {
    setEditingEntry(entry);
    setActiveSensor(entry.sensorType);
    setStep('capture');
  };

  const handleRemoveEntry = (entry: SensorEntry) => {
    setEntries((prev) => prev.filter((item) => item.entryId !== entry.entryId));
  };

  const handleSaveReport = async () => {
    if (!user) {
      return;
    }

    try {
      const report = await createReport(
        {
          observationType: observationType ?? 'General Environmental Observation',
          title,
          sensorEntries: entries
        },
        user.id
      );

      history.replace(`/app/report/${report.reportId}`);
    } catch (error) {
      console.error('Error saving report to Firestore', error);
    }
  };

  const stepLabel = useMemo(() => {
    switch (step) {
      case 'observation':
        return 'Select observation type';
      case 'sensors':
        return 'Choose sensors';
      case 'capture':
        return 'Capture evidence';
      case 'summary':
        return 'Review summary';
      default:
        return '';
    }
  }, [step]);

  return (
    <IonPage>
      <AppHeader title="Create Ecological Report ✍️" />
      <IonContent className={`eco-content ${styles.content}`}>
        <div className={styles.shell}>
          <div className={styles.stepper}>
            <IonSegment
              className={styles.segment}
              value={step}
              onIonChange={(event) => setStep(event.detail.value as ReportStep)}
            >
              <IonSegmentButton value="observation">Observation</IonSegmentButton>
              <IonSegmentButton value="sensors" disabled={!canGoToSensors}>
                Sensors
              </IonSegmentButton>
              <IonSegmentButton value="capture" disabled={!canGoToCapture}>
                Capture
              </IonSegmentButton>
              <IonSegmentButton value="summary" disabled={!canGoToSummary}>
                Summary
              </IonSegmentButton>
            </IonSegment>
          </div>
          <IonProgressBar value={stepProgress} />
          <div className={styles.stepHeader}>
            <h2 className={styles.sectionTitle}>{stepLabel}</h2>
            <p className={styles.sectionSubtitle}>
              Build a report by capturing evidence from the sensors that matter most 🧭
            </p>
          </div>

          {step === 'observation' && (
            <section className={styles.step}>
              <div className={styles.observationGrid}>
                {observationOptions.map((option) => (
                  <IonItem
                    key={option.id}
                    button
                    lines="none"
                    className={`${styles.selectableCard} ${
                      observationType === option.label ? styles.selectableCardSelected : ''
                    }`}
                    onClick={() => setObservationType(option.label)}
                  >
                    <IonLabel>
                      <h3>{option.label}</h3>
                      <p>{option.description}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </div>
              <div className={styles.actions}>
                <IonButton
                  expand="block"
                  onClick={() => setStep('sensors')}
                  disabled={!canGoToSensors}
                >
                  Continue to sensor selection
                </IonButton>
              </div>
            </section>
          )}

          {step === 'sensors' && (
            <section className={styles.step}>
              <SensorPicker
                selected={selectedSensors}
                available={availableSensors}
                onToggle={handleSensorToggle}
              />
              <IonText className={styles.availability}>
                Disabled sensors are not available on this device.
              </IonText>
              <div className={styles.actions}>
                <IonButton fill="outline" onClick={() => setStep('observation')}>
                  Back
                </IonButton>
                <IonButton onClick={() => setStep('capture')} disabled={!canGoToCapture}>
                  Begin capture
                </IonButton>
              </div>
            </section>
          )}

          {step === 'capture' && (
            <section className={styles.step}>
              <div className={styles.sensorChips}>
                {selectedSensors.map((sensor) => (
                  <IonChip
                    key={sensor}
                    color={activeSensor === sensor ? 'primary' : 'medium'}
                    onClick={() => {
                      setActiveSensor(sensor);
                      setEditingEntry(null);
                    }}
                  >
                    {sensor.replace('-', ' ')}
                  </IonChip>
                ))}
              </div>
              {activeSensor ? (
                <SensorCapturePanel
                  sensorType={activeSensor}
                  onSave={handleSaveEntry}
                  initialEntry={editingEntry?.sensorType === activeSensor
                    ? editingEntry
                    : null}
                />
              ) : (
                <IonText>Select a sensor to capture evidence.</IonText>
              )}
              <div className={styles.entriesGrid}>
                {entries.map((entry) => (
                  <SensorEntryCard
                    key={entry.entryId}
                    entry={entry}
                    onEdit={handleEditEntry}
                    onRemove={handleRemoveEntry}
                  />
                ))}
              </div>
              <div className={styles.actions}>
                <IonButton fill="outline" onClick={() => setStep('sensors')}>
                  Back
                </IonButton>
                <IonButton onClick={() => setStep('summary')} disabled={!canGoToSummary}>
                  Review summary
                </IonButton>
              </div>
            </section>
          )}

          {step === 'summary' && (
            <section className={styles.step}>
              <IonItem lines="none" className={styles.summaryItem}>
                <IonLabel position="stacked">Report title (optional)</IonLabel>
                <IonInput
                  className={styles.summaryInput}
                  value={title}
                  placeholder="Add a short title"
                  onIonChange={(event) => setTitle(event.detail.value ?? '')}
                />
              </IonItem>
              <IonItem lines="none" className={styles.summaryItem}>
                <IonLabel>Observation type</IonLabel>
                <IonText>{observationType ?? 'General Environmental Observation'}</IonText>
              </IonItem>
              <div className={styles.entriesGrid}>
                {entries.map((entry) => (
                  <SensorEntryCard
                    key={entry.entryId}
                    entry={entry}
                    onEdit={handleEditEntry}
                    onRemove={handleRemoveEntry}
                  />
                ))}
              </div>
              <div className={styles.actions}>
                <IonButton fill="outline" onClick={() => setStep('capture')}>
                  Back
                </IonButton>
                <IonButton onClick={handleSaveReport}>Save report</IonButton>
              </div>
            </section>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportCreate;
