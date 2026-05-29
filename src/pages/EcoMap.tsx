import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonText
} from '@ionic/react';
import { useMemo } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  alertCircleOutline,
  bugOutline,
  flameOutline,
  leafOutline,
  waterOutline
} from 'ionicons/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AppHeader from '../shared/AppHeader';
import styles from './EcoMap.module.scss';

const markers = [
  {
    id: 'reforest',
    label: 'Reforest patch',
    icon: leafOutline,
    tone: 'var(--eco-leaf)',
    position: [37.7845, -122.4474] as [number, number]
  },
  {
    id: 'water',
    label: 'Water quality check',
    icon: waterOutline,
    tone: 'var(--ion-color-secondary)',
    position: [37.7712, -122.4127] as [number, number]
  },
  {
    id: 'invasive',
    label: 'Invasive species',
    icon: bugOutline,
    tone: 'var(--app-score-caution)',
    position: [37.7609, -122.4432] as [number, number]
  },
  {
    id: 'fire',
    label: 'Fire risk zone',
    icon: flameOutline,
    tone: 'var(--ion-color-danger)',
    position: [37.7896, -122.4052] as [number, number]
  },
  {
    id: 'erosion',
    label: 'Erosion watch',
    icon: alertCircleOutline,
    tone: 'var(--app-score-fair)',
    position: [37.7732, -122.4296] as [number, number]
  }
];

const mapCenter: [number, number] = [37.7739, -122.4312];

const buildMarkerIcon = (icon: string, tone: string) =>
  L.divIcon({
    className: styles.leafletMarker,
    html: renderToStaticMarkup(
      <span
        className={styles.markerDot}
        style={{ ['--marker-color' as string]: tone }}
      >
        <IonIcon icon={icon} className={styles.markerIcon} />
      </span>
    ),
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

const EcoMap: React.FC = () => {
  const markerIcons = useMemo(() => {
    const iconMap: Record<string, L.DivIcon> = {};
    markers.forEach((marker) => {
      iconMap[marker.id] = buildMarkerIcon(marker.icon, marker.tone);
    });
    return iconMap;
  }, []);

  return (
    <IonPage>
      <AppHeader title="Eco Map 🗺️" />
      <IonContent className={`eco-content ${styles.content}`}>
        <div className={styles.shell}>
          <div className={styles.header}>
            <div>
              <IonText className={styles.kicker}>Field Signals 🌿</IonText>
              <h2 className={styles.title}>Ecological needs overview 🧭</h2>
              <p className={styles.subtitle}>
                Explore hotspots that need attention. Icons mark areas for follow-up
                surveys.
              </p>
            </div>
            <IonButton
              routerLink="/app/reports/new"
              className={styles.headerAction}
            >
              Log an observation ✍️
            </IonButton>
          </div>
          <div className={styles.mapCard}>
            <MapContainer
              className={styles.map}
              center={mapCenter}
              zoom={13}
              zoomControl={false}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={marker.position}
                  icon={markerIcons[marker.id]}
                  title={marker.label}
                />
              ))}
            </MapContainer>
          </div>
          <div className={styles.legend}>
            {markers.map((marker) => (
              <div key={`${marker.id}-legend`} className={styles.legendItem}>
                <IonIcon
                  icon={marker.icon}
                  className={styles.legendIcon}
                  style={{ ['--marker-color' as string]: marker.tone }}
                />
                <span>{marker.label}</span>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EcoMap;
