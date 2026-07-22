import { calculateCompoundRisk } from './lopa';
import type { IPLState, SensorReading } from '../store/useStore';

export interface SimulationVariables {
  STAFFING_RATIO: number;
  MAINTENANCE_BUDGET: number;
  PTW_COMPLIANCE_RATE: number;
  SAFETY_CULTURE_INDEX: number;
  SIS_PROOF_TEST_INTERVAL: number;
  GAS_DETECTOR_CALIBRATION: number;
  LADLE_INSPECTION_STATUS: number;
  ACTIVE_PERMIT_COUNT: number;
  EQUIPMENT_BYPASS_COUNT: number;
  CO_GAS_READING: number;
  FLAMMABLE_GAS_READING: number;
  LADLE_PRESSURE: number;
  WORKERS_IN_ZONE: number;
  SIMOPS_CONFLICTS_ACTIVE: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function lerpPoints(x: number, points: [number, number][]): number {
  if (x <= points[0][0]) return points[0][1];
  const last = points[points.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return last[1];
}

// SIS_PROOF_TEST_INTERVAL → IPL-2 and LADLE_INSPECTION_STATUS → IPL-4 both use
// this exact decay curve per spec: 7 days = 85, 14 days = 55, 30 days = 25.
const PROOF_TEST_DECAY: [number, number][] = [[7, 85], [14, 55], [30, 25]];

// CO_GAS_READING → IPL-1 (inverse: higher reading = lower BPCS effectiveness).
// Anchored so 25ppm (live baseline) ≈ 90, 50ppm (threshold) ≈ 62, 100ppm (critical) ≈ 25.
const CO_CURVE: [number, number][] = [[0, 95], [25, 90], [50, 62], [100, 25], [150, 12]];

/** Level 1 → Level 2/3 cascade defaults. Used to seed dependents when a Level-1
 *  node changes; the user can still override any individual node afterward. */
export function cascadeFromStaffing(ratio: number) {
  return { WORKERS_IN_ZONE: Math.round(5 * clamp(ratio, 0, 1)) };
}
export function cascadeFromMaintenanceBudget(budget: number) {
  return {
    LADLE_INSPECTION_STATUS: clamp(9 / budget, 3, 90),
    SIS_PROOF_TEST_INTERVAL: clamp(7 / budget, 3, 45),
    EQUIPMENT_BYPASS_COUNT: Math.round(clamp((1 - budget) * 5, 0, 10)),
  };
}
export function cascadeFromCompliance(compliance: number) {
  return {
    ACTIVE_PERMIT_COUNT: Math.round(clamp(4 + (1 - compliance) * 8, 2, 14)),
    SIMOPS_CONFLICTS_ACTIVE: Math.round(clamp((0.85 - compliance) * 6, 0, 4)),
  };
}

export interface PropagationResult {
  iplScores: Record<string, number>;
  compoundRisk: number;
}

/** Pure function: current variable snapshot → IPL scores → compound risk.
 *  No side effects, no dependency on live or simulation store state. */
export function propagateCausalGraph(
  variables: SimulationVariables,
  iplMeta: Pick<IPLState, 'id' | 'name' | 'shortName'>[]
): PropagationResult {
  const cultureAdjustment = (variables.SAFETY_CULTURE_INDEX - 70) / 70 * 5;

  const ipl1 = lerpPoints(variables.CO_GAS_READING, CO_CURVE)
    - Math.max(0, variables.GAS_DETECTOR_CALIBRATION - 14) * 0.5;
  const ipl2 = lerpPoints(variables.SIS_PROOF_TEST_INTERVAL, PROOF_TEST_DECAY)
    - variables.EQUIPMENT_BYPASS_COUNT * 8;
  const ipl3 = 90 - variables.SIMOPS_CONFLICTS_ACTIVE * 15;
  const ipl4 = lerpPoints(variables.LADLE_INSPECTION_STATUS, PROOF_TEST_DECAY);
  const ipl5 = 40 + (variables.STAFFING_RATIO - 0.5) * 90;

  const iplScores: Record<string, number> = {
    ipl1: Math.round(clamp(ipl1 + cultureAdjustment, 5, 98)),
    ipl2: Math.round(clamp(ipl2 + cultureAdjustment, 5, 98)),
    ipl3: Math.round(clamp(ipl3 + cultureAdjustment, 5, 98)),
    ipl4: Math.round(clamp(ipl4 + cultureAdjustment, 5, 98)),
    ipl5: Math.round(clamp(ipl5 + cultureAdjustment, 5, 98)),
  };

  const compoundRisk = calculateCompoundRisk(
    iplMeta.map(m => ({ ...m, score: iplScores[m.id], factors: '' }))
  );

  return { iplScores, compoundRisk };
}

/** Estimated probability (%) of a PSIF-class event in the next 60 minutes,
 *  derived from the compound risk score via a logistic curve centered at 75. */
export function estimateIncidentProbability(compoundRisk: number): number {
  const p = 100 / (1 + Math.exp(-(compoundRisk - 75) / 8));
  return Math.round(p * 10) / 10;
}

/** Auto-generated one-paragraph narrative describing what the current
 *  simulated conditions mean — computed from the live numbers, not scripted per preset. */
export function generateScenarioNarrative(
  variables: SimulationVariables,
  iplScores: Record<string, number>,
  compoundRisk: number,
  iplLabels: Record<string, string>
): string {
  const degraded = Object.entries(iplScores)
    .filter(([, score]) => score < 60)
    .map(([id]) => iplLabels[id]);

  const healthyCount = 5 - degraded.length;
  const level = compoundRisk >= 90 ? 'EMERGENCY' : compoundRisk >= 70 ? 'CRITICAL' : compoundRisk >= 40 ? 'ELEVATED' : 'NORMAL';

  const clauses: string[] = [];
  if (variables.STAFFING_RATIO < 0.75) {
    clauses.push(`staffing at ${Math.round(variables.STAFFING_RATIO * 100)}% of required`);
  }
  if (variables.SIS_PROOF_TEST_INTERVAL > 10) {
    clauses.push(`SIS proof testing ${Math.round(variables.SIS_PROOF_TEST_INTERVAL)} days overdue`);
  }
  if (variables.SIMOPS_CONFLICTS_ACTIVE > 0) {
    clauses.push(`${Math.round(variables.SIMOPS_CONFLICTS_ACTIVE)} active SIMOPS conflict${variables.SIMOPS_CONFLICTS_ACTIVE > 1 ? 's' : ''}`);
  }
  if (variables.EQUIPMENT_BYPASS_COUNT > 0) {
    clauses.push(`${Math.round(variables.EQUIPMENT_BYPASS_COUNT)} safety devices bypassed`);
  }

  const conditionText = clauses.length > 0
    ? `At ${clauses.join(', ')}, `
    : 'With current organizational and operational conditions, ';

  const layerText = degraded.length > 0
    ? `the plant is operating with only ${healthyCount} of 5 protection layers at adequate health (${degraded.join(', ')} below threshold).`
    : 'all 5 protection layers are at adequate health.';

  const historicalNote = compoundRisk >= 70
    ? ' Historical Indian incidents with comparable degraded-IPL profiles include the June 2026 VSP ladle bay explosion and the 2017 NTPC Unchahar boiler failure.'
    : '';

  return `${conditionText}${layerText} Compound risk stands at ${compoundRisk}/100 — ${level}.${historicalNote}`;
}

/** Inverts the STAFFING_RATIO → IPL-5 rule to seed a sandbox default from a live score. */
export function inferStaffingRatioFromScore(score: number): number {
  return clamp(0.5 + (score - 40) / 90, 0.3, 1.0);
}
/** Inverts the proof-test decay curve to seed SIS/ladle interval defaults from a live score. */
export function inferIntervalFromScore(score: number): number {
  if (score >= 85) return 7;
  if (score <= 25) return 30;
  if (score >= 55) {
    const t = (85 - score) / 30;
    return 7 + t * 7;
  }
  const t = (55 - score) / 30;
  return 14 + t * 16;
}

/** Seeds a full sandbox variable set from the current live plant state, per
 *  "Simulation variables are copies initialized from live values when sandbox
 *  tab opens." Level-1 org variables are inferred by inverting their scoring
 *  rule; Level-3 readings are copied straight from live sensors/conflicts. */
export function getLiveDefaultVariables(
  ipls: IPLState[],
  sensorReadings: Record<string, SensorReading>,
  simopsConflictCount: number,
  workersInZ1: number
): SimulationVariables {
  const byId = (id: string) => ipls.find(i => i.id === id)?.score ?? 80;

  return {
    STAFFING_RATIO: inferStaffingRatioFromScore(byId('ipl5')),
    MAINTENANCE_BUDGET: 1.0,
    PTW_COMPLIANCE_RATE: clamp(0.85 - simopsConflictCount / 6, 0.3, 1.0),
    SAFETY_CULTURE_INDEX: 70,
    SIS_PROOF_TEST_INTERVAL: inferIntervalFromScore(byId('ipl2')),
    GAS_DETECTOR_CALIBRATION: 10,
    LADLE_INSPECTION_STATUS: inferIntervalFromScore(byId('ipl4')),
    ACTIVE_PERMIT_COUNT: 4,
    EQUIPMENT_BYPASS_COUNT: 0,
    CO_GAS_READING: sensorReadings['S01']?.value ?? 25,
    FLAMMABLE_GAS_READING: sensorReadings['S07']?.value ?? 3,
    LADLE_PRESSURE: sensorReadings['S09']?.value ?? 1.2,
    WORKERS_IN_ZONE: workersInZ1,
    SIMOPS_CONFLICTS_ACTIVE: simopsConflictCount,
  };
}
