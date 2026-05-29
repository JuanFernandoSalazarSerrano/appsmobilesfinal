import { ObservationType, SensorType } from '../models/report';

export interface ObservationOption {
  id: string;
  label: ObservationType;
  description: string;
}

export const observationOptions: ObservationOption[] = [
  {
    id: 'vegetation',
    label: 'Vegetation / Forest',
    description: 'Canopy health, understory density, or land cover changes.'
  },
  {
    id: 'water',
    label: 'Water Source',
    description: 'Streams, lakes, wetlands, or visible pollution indicators.'
  },
  {
    id: 'urban',
    label: 'Urban Environment',
    description: 'Infrastructure impact, waste, and built environment context.'
  },
  {
    id: 'wildlife',
    label: 'Wildlife / Biodiversity',
    description: 'Species activity, habitat notes, and biodiversity signals.'
  },
  {
    id: 'air',
    label: 'Air Pollution',
    description: 'Odors, haze, particulate indicators, and wind context.'
  },
  {
    id: 'noise',
    label: 'Noise Pollution',
    description: 'Soundscape levels, sources, and ambient noise patterns.'
  },
  {
    id: 'soil',
    label: 'Soil / Terrain',
    description: 'Erosion, soil texture, and ground cover observations.'
  },
  {
    id: 'general',
    label: 'General Environmental Observation',
    description: 'Quick field note when a specific category is not clear.'
  }
];

export interface SensorOption {
  type: SensorType;
  label: string;
  description: string;
  category: 'media' | 'location' | 'environment' | 'device';
}

export const sensorOptions: SensorOption[] = [
  {
    type: 'camera',
    label: 'Camera',
    description: 'Capture visual evidence of the environment.',
    category: 'media'
  },
  {
    type: 'microphone',
    label: 'Microphone',
    description: 'Record soundscapes and noise pollution cues.',
    category: 'media'
  },
  {
    type: 'gps',
    label: 'GPS / Location',
    description: 'Geotag the observation and add location context.',
    category: 'location'
  },
  {
    type: 'ambient-light',
    label: 'Ambient Light',
    description: 'Capture lighting conditions and exposure levels.',
    category: 'environment'
  },
  {
    type: 'accelerometer',
    label: 'Accelerometer',
    description: 'Detect movement, terrain vibration, or device motion.',
    category: 'environment'
  },
  {
    type: 'gyroscope',
    label: 'Gyroscope',
    description: 'Orientation changes that hint at slope or tilt.',
    category: 'environment'
  },
  {
    type: 'magnetometer',
    label: 'Magnetometer',
    description: 'Compass readings for directional notes.',
    category: 'environment'
  },
  {
    type: 'barometer',
    label: 'Barometer',
    description: 'Air pressure and weather context (if available).',
    category: 'environment'
  },
  {
    type: 'battery',
    label: 'Battery Status',
    description: 'Capture device battery level for context.',
    category: 'device'
  },
  {
    type: 'timestamp',
    label: 'Timestamp',
    description: 'Log when the observation was captured.',
    category: 'device'
  },
  {
    type: 'network',
    label: 'Network Status',
    description: 'Note connectivity at the observation site.',
    category: 'device'
  }
];

export const defaultAvailableSensors: Record<SensorType, boolean> = {
  camera: true,
  microphone: true,
  gps: true,
  'ambient-light': true,
  accelerometer: true,
  gyroscope: true,
  magnetometer: true,
  barometer: false,
  battery: true,
  timestamp: true,
  network: true
};
