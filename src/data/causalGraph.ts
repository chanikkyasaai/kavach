export type CausalLevel = 1 | 2 | 3;
export type CausalStrength = 'strong' | 'medium' | 'weak';

export interface CausalVariable {
  id: string;
  level: CausalLevel;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  /** +1 if a higher value is safer (e.g. staffing ratio), -1 if a higher value is more dangerous (e.g. days overdue). */
  saferDirection: 1 | -1;
}

export interface CausalEdge {
  from: string;
  to: string; // variable id, or an IPL id ('ipl1'..'ipl5')
  strength: CausalStrength;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;
const days = (v: number) => `${Math.round(v)}d`;
const count = (v: number) => `${Math.round(v)}`;

export const CAUSAL_VARIABLES: CausalVariable[] = [
  // Level 1 — Organizational / Management
  { id: 'STAFFING_RATIO', level: 1, label: 'Staffing Ratio', unit: '', min: 0.3, max: 1.0, step: 0.01, format: pct, saferDirection: 1 },
  { id: 'MAINTENANCE_BUDGET', level: 1, label: 'Maintenance Budget', unit: '', min: 0.4, max: 1.2, step: 0.01, format: pct, saferDirection: 1 },
  { id: 'PTW_COMPLIANCE_RATE', level: 1, label: 'PTW Compliance Rate', unit: '', min: 0.3, max: 1.0, step: 0.01, format: pct, saferDirection: 1 },
  { id: 'SAFETY_CULTURE_INDEX', level: 1, label: 'Safety Culture Index', unit: '', min: 0, max: 100, step: 1, format: count, saferDirection: 1 },

  // Level 2 — Process / Equipment
  { id: 'SIS_PROOF_TEST_INTERVAL', level: 2, label: 'SIS Proof Test Interval', unit: 'days', min: 3, max: 45, step: 1, format: days, saferDirection: -1 },
  { id: 'GAS_DETECTOR_CALIBRATION', level: 2, label: 'Gas Detector Calibration Age', unit: 'days', min: 0, max: 60, step: 1, format: days, saferDirection: -1 },
  { id: 'LADLE_INSPECTION_STATUS', level: 2, label: 'Ladle Inspection Interval', unit: 'days', min: 3, max: 90, step: 1, format: days, saferDirection: -1 },
  { id: 'ACTIVE_PERMIT_COUNT', level: 2, label: 'Active Permit Count', unit: '', min: 2, max: 14, step: 1, format: count, saferDirection: -1 },
  { id: 'EQUIPMENT_BYPASS_COUNT', level: 2, label: 'Equipment Bypass Count', unit: '', min: 0, max: 10, step: 1, format: count, saferDirection: -1 },

  // Level 3 — Operational / Real-time
  { id: 'CO_GAS_READING', level: 3, label: 'CO Gas Reading', unit: 'ppm', min: 0, max: 150, step: 1, format: v => `${Math.round(v)}ppm`, saferDirection: -1 },
  { id: 'FLAMMABLE_GAS_READING', level: 3, label: 'Flammable Gas Reading', unit: '%LEL', min: 0, max: 30, step: 0.5, format: v => `${v.toFixed(1)}%LEL`, saferDirection: -1 },
  { id: 'LADLE_PRESSURE', level: 3, label: 'Ladle Pressure', unit: 'bar', min: 0, max: 5, step: 0.1, format: v => `${v.toFixed(1)}bar`, saferDirection: -1 },
  { id: 'WORKERS_IN_ZONE', level: 3, label: 'Workers in Zone (SMS)', unit: '', min: 0, max: 8, step: 1, format: count, saferDirection: -1 },
  { id: 'SIMOPS_CONFLICTS_ACTIVE', level: 3, label: 'SIMOPS Conflicts Active', unit: '', min: 0, max: 4, step: 1, format: count, saferDirection: -1 },
];

export const CAUSAL_EDGES: CausalEdge[] = [
  // Level 1 → Level 2/3/IPL
  { from: 'STAFFING_RATIO', to: 'ipl5', strength: 'strong' },
  { from: 'STAFFING_RATIO', to: 'WORKERS_IN_ZONE', strength: 'medium' },
  { from: 'MAINTENANCE_BUDGET', to: 'LADLE_INSPECTION_STATUS', strength: 'strong' },
  { from: 'MAINTENANCE_BUDGET', to: 'SIS_PROOF_TEST_INTERVAL', strength: 'strong' },
  { from: 'MAINTENANCE_BUDGET', to: 'EQUIPMENT_BYPASS_COUNT', strength: 'medium' },
  { from: 'PTW_COMPLIANCE_RATE', to: 'ACTIVE_PERMIT_COUNT', strength: 'medium' },
  { from: 'PTW_COMPLIANCE_RATE', to: 'SIMOPS_CONFLICTS_ACTIVE', strength: 'strong' },
  { from: 'SAFETY_CULTURE_INDEX', to: 'ipl1', strength: 'weak' },
  { from: 'SAFETY_CULTURE_INDEX', to: 'ipl2', strength: 'weak' },
  { from: 'SAFETY_CULTURE_INDEX', to: 'ipl3', strength: 'weak' },
  { from: 'SAFETY_CULTURE_INDEX', to: 'ipl4', strength: 'weak' },
  { from: 'SAFETY_CULTURE_INDEX', to: 'ipl5', strength: 'weak' },

  // Level 2 → Level 3/IPL
  { from: 'SIS_PROOF_TEST_INTERVAL', to: 'ipl2', strength: 'strong' },
  { from: 'EQUIPMENT_BYPASS_COUNT', to: 'ipl2', strength: 'medium' },
  { from: 'LADLE_INSPECTION_STATUS', to: 'ipl4', strength: 'strong' },
  { from: 'GAS_DETECTOR_CALIBRATION', to: 'ipl1', strength: 'weak' },

  // Level 3 → IPL
  { from: 'CO_GAS_READING', to: 'ipl1', strength: 'strong' },
  { from: 'SIMOPS_CONFLICTS_ACTIVE', to: 'ipl3', strength: 'strong' },
];

export const IPL_LABELS: Record<string, string> = {
  ipl1: 'IPL-1 BPCS',
  ipl2: 'IPL-2 SIS',
  ipl3: 'IPL-3 PTW',
  ipl4: 'IPL-4 MECH',
  ipl5: 'IPL-5 HF',
};
