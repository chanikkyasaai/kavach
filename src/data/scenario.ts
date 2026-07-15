export interface ScenarioEvent {
  timeMinute: number;
  type: 'sensor_change' | 'ipl_degrade' | 'permit_issue' | 'simops_conflict' | 'alert' | 'incident';
  description: string;
  effects: ScenarioEffect[];
}

export interface ScenarioEffect {
  target: string;
  field: string;
  value: number | string | boolean;
}

export const scenarioTimeline: ScenarioEvent[] = [
  // Phase 1: Normal operations (0-10 min)
  {
    timeMinute: 0,
    type: 'sensor_change',
    description: 'Scenario begins. Normal plant operations.',
    effects: [],
  },
  // Phase 2: Subtle degradations begin (10-20 min)
  {
    timeMinute: 10,
    type: 'ipl_degrade',
    description: 'Shift handover incomplete — 2 operators short of minimum staffing for Melt Shop zone.',
    effects: [
      { target: 'ipl5', field: 'score', value: 72 },
      { target: 'ipl5', field: 'factors', value: 'Understaffed: 2/3 qualified operators present in Z1. Cumulative overtime: 14hrs for current crew.' },
    ],
  },
  {
    timeMinute: 14,
    type: 'ipl_degrade',
    description: 'SIS proof test overdue by 6 days on BOF emergency shutdown system.',
    effects: [
      { target: 'ipl2', field: 'score', value: 68 },
      { target: 'ipl2', field: 'factors', value: 'Proof test overdue: 13 days since last test (required: 7 days). BOF ESD system degraded.' },
    ],
  },
  {
    timeMinute: 18,
    type: 'sensor_change',
    description: 'CO levels in Melt Shop begin gradual rise — still within normal range but rate of change anomalous.',
    effects: [
      { target: 'S01', field: 'value', value: 35 },
      { target: 'S01', field: 'rateOfChange', value: 2.5 },
    ],
  },
  {
    timeMinute: 20,
    type: 'permit_issue',
    description: 'PTW-438 (confined space entry in Z1) issued WITHOUT complete PHSA sign-off. Isolations not verified.',
    effects: [
      { target: 'ipl3', field: 'score', value: 62 },
      { target: 'ipl3', field: 'factors', value: 'PTW-438 issued without PHSA completion. Isolations unverified for confined space entry in active melt zone.' },
    ],
  },
  // Phase 3: Compound degradation (20-30 min)
  {
    timeMinute: 22,
    type: 'sensor_change',
    description: 'Ladle pressure rising — approaching upper normal band.',
    effects: [
      { target: 'S09', field: 'value', value: 1.8 },
      { target: 'S09', field: 'rateOfChange', value: 0.15 },
    ],
  },
  {
    timeMinute: 24,
    type: 'ipl_degrade',
    description: 'Overdue inspection on Gas Holder #3 (62 days overdue). Critical work order backlog: 3 items.',
    effects: [
      { target: 'ipl4', field: 'score', value: 65 },
      { target: 'ipl4', field: 'factors', value: 'Gas Holder #3: inspection 62 days overdue. 3 critical work orders past due date. Equipment age: 73% of design life.' },
    ],
  },
  {
    timeMinute: 26,
    type: 'sensor_change',
    description: 'CO levels continue rising. Flammable gas sensors in Z1 perimeter showing elevated readings.',
    effects: [
      { target: 'S01', field: 'value', value: 42 },
      { target: 'S07', field: 'value', value: 7 },
      { target: 'S01', field: 'rateOfChange', value: 3.2 },
    ],
  },
  {
    timeMinute: 28,
    type: 'ipl_degrade',
    description: 'BPCS score degrades — multiple sensors showing anomalous rate of change.',
    effects: [
      { target: 'ipl1', field: 'score', value: 70 },
      { target: 'ipl1', field: 'factors', value: 'Rate-of-change anomaly on 3 sensors: CO (+3.2 ppm/min), Flammable Gas (+1.5 %LEL/min), Ladle Pressure (+0.15 bar/min). All below threshold but velocity anomalous.' },
    ],
  },
  // Phase 4: SIMOPS conflict emerges (30-35 min)
  {
    timeMinute: 31,
    type: 'simops_conflict',
    description: 'OISD-STD-105 VIOLATION: Hot work permit PTW-437 active in Z1 while flammable gas reading at 7% LEL (>5% LEL limit for concurrent hot work). Confined space entry PTW-438 in same zone.',
    effects: [
      { target: 'ipl3', field: 'score', value: 45 },
      { target: 'ipl3', field: 'factors', value: 'SIMOPS CONFLICT: Hot work (PTW-437) + Confined space (PTW-438) in Z1 with elevated flammable gas (7% LEL > 5% limit). OISD-STD-105 Rule 4.3.2 violated.' },
      { target: 'alert', field: 'level', value: 'amber' },
    ],
  },
  {
    timeMinute: 33,
    type: 'sensor_change',
    description: 'All sensors in Z1 accelerating. Precursor conditions forming.',
    effects: [
      { target: 'S01', field: 'value', value: 55 },
      { target: 'S07', field: 'value', value: 12 },
      { target: 'S09', field: 'value', value: 2.2 },
      { target: 'S02', field: 'value', value: 68 },
      { target: 'ipl1', field: 'score', value: 55 },
      { target: 'ipl1', field: 'factors', value: 'CRITICAL: CO at 55ppm (threshold 50), Flammable gas 12% LEL (threshold 10%), Ladle pressure 2.2 bar (threshold 2.5). Multiple parameters at or exceeding threshold.' },
    ],
  },
  // Phase 5: The precursor event and critical alert (35-45 min)
  {
    timeMinute: 35,
    type: 'incident',
    description: 'PRECURSOR EVENT: Ladle pressure spike — minor explosion at ladle bay (analog to 3:57 PM VSP event). Immediate pressure release, CO surge, gas readings spike.',
    effects: [
      { target: 'S01', field: 'value', value: 88 },
      { target: 'S07', field: 'value', value: 22 },
      { target: 'S09', field: 'value', value: 3.5 },
      { target: 'S02', field: 'value', value: 95 },
      { target: 'ipl1', field: 'score', value: 30 },
      { target: 'ipl1', field: 'factors', value: 'EMERGENCY: CO at 88ppm (critical: 100), Flammable gas 22% LEL (critical: 25%), Ladle pressure 3.5 bar (critical: 4.0). Precursor explosion detected. Immediate intervention required.' },
      { target: 'ipl2', field: 'score', value: 55 },
      { target: 'ipl5', field: 'score', value: 60 },
      { target: 'alert', field: 'level', value: 'critical' },
    ],
  },
  {
    timeMinute: 38,
    type: 'sensor_change',
    description: 'Post-precursor: conditions continue deteriorating. Without intervention, fatal explosion in ~5 minutes.',
    effects: [
      { target: 'S01', field: 'value', value: 95 },
      { target: 'S07', field: 'value', value: 24 },
      { target: 'S09', field: 'value', value: 3.8 },
    ],
  },
  {
    timeMinute: 43,
    type: 'incident',
    description: 'SCENARIO END POINT: In reality, the fatal explosion occurred here (analog to 4:15 PM). KAVACH fired critical alert at T=35 — 8 minutes of warning.',
    effects: [],
  },
];

export const SCENARIO_DURATION_MINUTES = 45;
export const DEFAULT_SPEED_MULTIPLIER = 10;
