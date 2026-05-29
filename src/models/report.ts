export type ObservationType =
  | 'Vegetation / Forest'
  | 'Water Source'
  | 'Urban Environment'
  | 'Wildlife / Biodiversity'
  | 'Air Pollution'
  | 'Noise Pollution'
  | 'Soil / Terrain'
  | 'General Environmental Observation';

export type SensorType =
  | 'camera'
  | 'microphone'
  | 'gps'
  | 'ambient-light'
  | 'accelerometer'
  | 'gyroscope'
  | 'magnetometer'
  | 'barometer'
  | 'battery'
  | 'timestamp'
  | 'network';

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface SensorEntry {
  entryId: string;
  sensorType: SensorType;
  dataLabel?: string;
  dataValue?: string;
  mediaUrl?: string;
  description: string;
  timestamp: string;
}

export interface Report {
  reportId: string;
  userId: string;
  title?: string;
  observationType: ObservationType;
  createdAt: string;
  updatedAt: string;
  location?: LocationInfo;
  sensorEntries: SensorEntry[];
}

export interface ReportDraft {
  observationType?: ObservationType;
  title?: string;
  location?: LocationInfo;
  sensorEntries: SensorEntry[];
}
