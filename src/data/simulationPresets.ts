import type { SimulationVariables } from '../utils/causalEngine';
import { cascadeFromCompliance, cascadeFromMaintenanceBudget } from '../utils/causalEngine';

export interface SimulationPreset {
  id: string;
  label: string;
  description: string;
  variables: SimulationVariables;
}

export const simulationPresets: SimulationPreset[] = [
  {
    id: 'vsp-pre-incident',
    label: 'VSP June 8, 2026 — Pre-Incident Conditions',
    description: 'The forensic reconstruction: exact organizational conditions 45 minutes before the explosion.',
    variables: {
      STAFFING_RATIO: 0.61,
      MAINTENANCE_BUDGET: 0.80,
      PTW_COMPLIANCE_RATE: 0.72,
      SAFETY_CULTURE_INDEX: 65,
      SIS_PROOF_TEST_INTERVAL: 13,
      GAS_DETECTOR_CALIBRATION: 10,
      LADLE_INSPECTION_STATUS: 10,
      ACTIVE_PERMIT_COUNT: cascadeFromCompliance(0.72).ACTIVE_PERMIT_COUNT,
      EQUIPMENT_BYPASS_COUNT: 0,
      CO_GAS_READING: 25,
      FLAMMABLE_GAS_READING: 3,
      LADLE_PRESSURE: 1.2,
      WORKERS_IN_ZONE: 3,
      SIMOPS_CONFLICTS_ACTIVE: cascadeFromCompliance(0.72).SIMOPS_CONFLICTS_ACTIVE,
    },
  },
  {
    id: 'best-practice',
    label: 'Best Practice Operations',
    description: 'Full staffing, current proof tests, zero SIMOPS conflicts — the safest this model can represent.',
    variables: {
      STAFFING_RATIO: 1.0,
      MAINTENANCE_BUDGET: 1.0,
      PTW_COMPLIANCE_RATE: 1.0,
      SAFETY_CULTURE_INDEX: 90,
      SIS_PROOF_TEST_INTERVAL: 7,
      GAS_DETECTOR_CALIBRATION: 3,
      LADLE_INSPECTION_STATUS: 7,
      ACTIVE_PERMIT_COUNT: 4,
      EQUIPMENT_BYPASS_COUNT: 0,
      CO_GAS_READING: 15,
      FLAMMABLE_GAS_READING: 1.5,
      LADLE_PRESSURE: 1.0,
      WORKERS_IN_ZONE: 5,
      SIMOPS_CONFLICTS_ACTIVE: 0,
    },
  },
  {
    id: 'privatization-stress',
    label: 'Privatization Stress Scenario',
    description: 'Documented post-workforce-reduction conditions — no process anomaly, purely organizational degradation.',
    variables: {
      STAFFING_RATIO: 0.45,
      MAINTENANCE_BUDGET: 0.60,
      PTW_COMPLIANCE_RATE: 0.65,
      SAFETY_CULTURE_INDEX: 40,
      SIS_PROOF_TEST_INTERVAL: cascadeFromMaintenanceBudget(0.60).SIS_PROOF_TEST_INTERVAL,
      GAS_DETECTOR_CALIBRATION: 20,
      LADLE_INSPECTION_STATUS: cascadeFromMaintenanceBudget(0.60).LADLE_INSPECTION_STATUS,
      ACTIVE_PERMIT_COUNT: cascadeFromCompliance(0.65).ACTIVE_PERMIT_COUNT,
      EQUIPMENT_BYPASS_COUNT: cascadeFromMaintenanceBudget(0.60).EQUIPMENT_BYPASS_COUNT,
      CO_GAS_READING: 30,
      FLAMMABLE_GAS_READING: 4,
      LADLE_PRESSURE: 1.4,
      WORKERS_IN_ZONE: 2,
      SIMOPS_CONFLICTS_ACTIVE: cascadeFromCompliance(0.65).SIMOPS_CONFLICTS_ACTIVE,
    },
  },
];
