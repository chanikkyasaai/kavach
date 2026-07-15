export interface Sensor {
  id: string;
  name: string;
  unit: string;
  zone: string;
  baseline: number;
  threshold: number;
  criticalThreshold: number;
  position: { x: number; y: number; z: number };
}

export const sensors: Sensor[] = [
  { id: 'S01', name: 'CO Level - Melt Shop', unit: 'ppm', zone: 'Z1', baseline: 25, threshold: 50, criticalThreshold: 100, position: { x: -3, y: 0.5, z: -2 } },
  { id: 'S02', name: 'Temperature - Ladle Bay', unit: '°C', zone: 'Z1', baseline: 45, threshold: 80, criticalThreshold: 120, position: { x: -1, y: 0.5, z: -2 } },
  { id: 'S03', name: 'Pressure - BF Gas Main', unit: 'kPa', zone: 'Z2', baseline: 12, threshold: 25, criticalThreshold: 40, position: { x: 2, y: 0.5, z: -1 } },
  { id: 'S04', name: 'H2S Level - Coke Oven', unit: 'ppm', zone: 'Z3', baseline: 5, threshold: 10, criticalThreshold: 20, position: { x: -3, y: 0.5, z: 2 } },
  { id: 'S05', name: 'O2 Level - Confined Space', unit: '%', zone: 'Z4', baseline: 20.9, threshold: 19.5, criticalThreshold: 18.0, position: { x: 1, y: 0.5, z: 2 } },
  { id: 'S06', name: 'Vibration - Rolling Mill', unit: 'mm/s', zone: 'Z5', baseline: 4.5, threshold: 11, criticalThreshold: 18, position: { x: 3, y: 0.5, z: 0 } },
  { id: 'S07', name: 'Flammable Gas - Z1 Perimeter', unit: '% LEL', zone: 'Z1', baseline: 3, threshold: 10, criticalThreshold: 25, position: { x: -2, y: 0.5, z: -1 } },
  { id: 'S08', name: 'Temperature - BF Stove', unit: '°C', zone: 'Z2', baseline: 1100, threshold: 1250, criticalThreshold: 1350, position: { x: 3, y: 0.5, z: -2 } },
  { id: 'S09', name: 'Pressure - Ladle', unit: 'bar', zone: 'Z1', baseline: 1.2, threshold: 2.5, criticalThreshold: 4.0, position: { x: 0, y: 0.5, z: -2 } },
  { id: 'S10', name: 'Dust Level - Sinter Plant', unit: 'mg/m³', zone: 'Z6', baseline: 5, threshold: 15, criticalThreshold: 30, position: { x: -4, y: 0.5, z: 0 } },
  { id: 'S11', name: 'Noise - Steel Melting', unit: 'dB', zone: 'Z1', baseline: 85, threshold: 100, criticalThreshold: 115, position: { x: -1, y: 0.5, z: -3 } },
  { id: 'S12', name: 'CO2 Level - Gas Holder', unit: '%', zone: 'Z2', baseline: 0.5, threshold: 1.5, criticalThreshold: 3.0, position: { x: 4, y: 0.5, z: -1 } },
];
