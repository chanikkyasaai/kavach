import { create } from 'zustand';
import { sensors } from '../data/sensors';
import type { Sensor } from '../data/sensors';
import { workers } from '../data/workers';
import type { Worker } from '../data/workers';
import { permits } from '../data/permits';
import type { Permit } from '../data/permits';
import { scenarioTimeline, SCENARIO_DURATION_MINUTES, DEFAULT_SPEED_MULTIPLIER } from '../data/scenario';
import { interventions } from '../data/interventions';

export interface IPLState {
  id: string;
  name: string;
  shortName: string;
  score: number;
  factors: string;
}

export interface Alert {
  id: string;
  timestamp: number;
  level: 'info' | 'amber' | 'critical';
  title: string;
  description: string;
  zone: string;
  acknowledged: boolean;
}

export interface SensorReading {
  id: string;
  value: number;
  rateOfChange: number;
  history: number[];
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface KavachState {
  // Scenario control
  isPlaying: boolean;
  scenarioTime: number; // in minutes (0-45)
  speedMultiplier: number;
  lastProcessedEventIndex: number;

  // IPL scores
  ipls: IPLState[];
  compoundRisk: number;

  // Sensor data
  sensorReadings: Record<string, SensorReading>;

  // Workers
  workers: Worker[];

  // Permits
  permits: Permit[];

  // Alerts
  alerts: Alert[];

  // SIMOPS conflicts
  simopsConflicts: string[];

  // Copilot
  copilotMessages: CopilotMessage[];
  copilotLoading: boolean;

  // Evidence bundle
  evidenceBundleVisible: boolean;

  // Selected zone for highlighting
  selectedZone: string | null;
  criticalZones: string[];

  // Ambient sound
  soundMuted: boolean;

  // Safety Loop (bow-tie + reactive interventions)
  centerTab: '3d' | 'safety-loop';
  safetyLoopAutoTriggered: boolean;
  executedInterventions: string[];

  // Actions
  startScenario: () => void;
  pauseScenario: () => void;
  resetScenario: () => void;
  setSpeed: (speed: number) => void;
  tick: () => void;
  acknowledgeAlert: (id: string) => void;
  addCopilotMessage: (msg: CopilotMessage) => void;
  setCopilotLoading: (loading: boolean) => void;
  setSelectedZone: (zone: string | null) => void;
  showEvidenceBundle: () => void;
  hideEvidenceBundle: () => void;
  toggleSoundMuted: () => void;
  setCenterTab: (tab: '3d' | 'safety-loop') => void;
  executeIntervention: (id: string) => void;
}

function calculateCompoundRisk(ipls: IPLState[]): number {
  const product = ipls.reduce((acc, ipl) => acc * (ipl.score / 100), 1);
  return Math.round(100 * (1 - product));
}

function getInitialIPLs(): IPLState[] {
  return [
    { id: 'ipl1', name: 'Basic Process Control (BPCS)', shortName: 'BPCS', score: 92, factors: 'All sensors within normal range. No anomalous rate-of-change detected.' },
    { id: 'ipl2', name: 'Safety Instrumented System (SIS)', shortName: 'SIS', score: 85, factors: 'Proof tests current. No active bypasses. Test completion rate: 94%.' },
    { id: 'ipl3', name: 'Administrative Controls (PTW)', shortName: 'PTW', score: 88, factors: 'All active permits have PHSA sign-off. No SIMOPS conflicts detected.' },
    { id: 'ipl4', name: 'Mechanical Integrity', shortName: 'MECH', score: 78, factors: '1 overdue inspection (Gas Holder #3). 3 open critical work orders.' },
    { id: 'ipl5', name: 'Human Factors (Workforce)', shortName: 'HF', score: 85, factors: 'Staffing adequate. Training current for active zone workers.' },
  ];
}

function getInitialSensorReadings(): Record<string, SensorReading> {
  const readings: Record<string, SensorReading> = {};
  sensors.forEach((s: Sensor) => {
    readings[s.id] = {
      id: s.id,
      value: s.baseline + (Math.random() - 0.5) * s.baseline * 0.1,
      rateOfChange: 0,
      history: Array(60).fill(s.baseline).map(v => v + (Math.random() - 0.5) * s.baseline * 0.05),
    };
  });
  return readings;
}

export const useStore = create<KavachState>((set, get) => ({
  isPlaying: false,
  scenarioTime: 0,
  speedMultiplier: DEFAULT_SPEED_MULTIPLIER,
  lastProcessedEventIndex: -1,

  ipls: getInitialIPLs(),
  compoundRisk: calculateCompoundRisk(getInitialIPLs()),

  sensorReadings: getInitialSensorReadings(),
  workers: [...workers],
  permits: [...permits],
  alerts: [],
  simopsConflicts: [],
  copilotMessages: [],
  copilotLoading: false,
  evidenceBundleVisible: false,
  selectedZone: null,
  criticalZones: [],
  soundMuted: false,

  centerTab: '3d',
  safetyLoopAutoTriggered: false,
  executedInterventions: [],

  startScenario: () => set({ isPlaying: true }),
  pauseScenario: () => set({ isPlaying: false }),

  resetScenario: () => set({
    isPlaying: false,
    scenarioTime: 0,
    lastProcessedEventIndex: -1,
    ipls: getInitialIPLs(),
    compoundRisk: calculateCompoundRisk(getInitialIPLs()),
    sensorReadings: getInitialSensorReadings(),
    workers: [...workers],
    permits: [...permits],
    alerts: [],
    simopsConflicts: [],
    copilotMessages: [],
    copilotLoading: false,
    evidenceBundleVisible: false,
    selectedZone: null,
    criticalZones: [],
    centerTab: '3d',
    safetyLoopAutoTriggered: false,
    executedInterventions: [],
  }),

  setSpeed: (speed: number) => set({ speedMultiplier: speed }),

  tick: () => {
    const state = get();
    if (!state.isPlaying) return;

    // At 500ms tick interval: advance (speed * 0.5) / 60 minutes per tick
    // At 10x speed: 10 * 0.5 / 60 = 0.083 min/tick → 45 min in ~4.5 real minutes
    const newTime = Math.min(state.scenarioTime + (state.speedMultiplier * 0.5) / 60, SCENARIO_DURATION_MINUTES);

    // Process events
    let newIPLs = [...state.ipls];
    let newReadings = { ...state.sensorReadings };
    let newAlerts = [...state.alerts];
    let newConflicts = [...state.simopsConflicts];
    let newCriticalZones = [...state.criticalZones];
    let showEvidence = state.evidenceBundleVisible;
    let lastIdx = state.lastProcessedEventIndex;

    for (let i = lastIdx + 1; i < scenarioTimeline.length; i++) {
      const event = scenarioTimeline[i];
      if (event.timeMinute <= newTime) {
        lastIdx = i;

        for (const effect of event.effects) {
          if (effect.target.startsWith('ipl')) {
            const iplIdx = newIPLs.findIndex(ipl => ipl.id === effect.target);
            if (iplIdx >= 0) {
              if (effect.field === 'score') {
                newIPLs[iplIdx] = { ...newIPLs[iplIdx], score: effect.value as number };
              } else if (effect.field === 'factors') {
                newIPLs[iplIdx] = { ...newIPLs[iplIdx], factors: effect.value as string };
              }
            }
          } else if (effect.target.startsWith('S')) {
            const reading = newReadings[effect.target];
            if (reading) {
              if (effect.field === 'value') {
                const newHistory = [...reading.history.slice(1), effect.value as number];
                newReadings[effect.target] = { ...reading, value: effect.value as number, history: newHistory };
              } else if (effect.field === 'rateOfChange') {
                newReadings[effect.target] = { ...reading, rateOfChange: effect.value as number };
              }
            }
          } else if (effect.target === 'alert') {
            if (effect.value === 'amber') {
              newAlerts.push({
                id: `alert-${Date.now()}-${i}`,
                timestamp: newTime,
                level: 'amber',
                title: 'SIMOPS CONFLICT DETECTED',
                description: event.description,
                zone: 'Z1',
                acknowledged: false,
              });
              newConflicts = ['PTW-437 × PTW-438: Hot Work + Confined Space in Z1 with elevated flammable gas'];
              newCriticalZones = ['Z1'];
            } else if (effect.value === 'critical') {
              newAlerts.push({
                id: `alert-${Date.now()}-${i}`,
                timestamp: newTime,
                level: 'critical',
                title: 'CRITICAL: COMPOUND RISK THRESHOLD EXCEEDED',
                description: event.description,
                zone: 'Z1',
                acknowledged: false,
              });
              newCriticalZones = ['Z1', 'Z2'];
              showEvidence = true;
            }
          }
        }

        // Also push info alert for significant events
        if (event.type === 'ipl_degrade' || event.type === 'simops_conflict' || event.type === 'incident') {
          if (!event.effects.some(e => e.target === 'alert')) {
            newAlerts.push({
              id: `info-${Date.now()}-${i}`,
              timestamp: newTime,
              level: 'info',
              title: event.type === 'incident' ? 'INCIDENT EVENT' : 'IPL DEGRADATION',
              description: event.description,
              zone: 'Z1',
              acknowledged: false,
            });
          }
        }
      } else {
        break;
      }
    }

    // Add noise to sensor readings that haven't been explicitly set
    Object.keys(newReadings).forEach(id => {
      const sensor = sensors.find(s => s.id === id);
      if (sensor) {
        const reading = newReadings[id];
        const noise = (Math.random() - 0.5) * sensor.baseline * 0.02;
        const newValue = reading.value + noise;
        const newHistory = [...reading.history.slice(1), newValue];
        newReadings[id] = { ...reading, value: newValue, history: newHistory };
      }
    });

    const newCompoundRisk = calculateCompoundRisk(newIPLs);

    // Auto-surface the Safety Loop panel the first time risk crosses into "elevated" territory.
    const shouldAutoTrigger = !state.safetyLoopAutoTriggered && state.compoundRisk < 60 && newCompoundRisk >= 60;

    set({
      scenarioTime: newTime,
      lastProcessedEventIndex: lastIdx,
      ipls: newIPLs,
      compoundRisk: newCompoundRisk,
      sensorReadings: newReadings,
      alerts: newAlerts,
      simopsConflicts: newConflicts,
      criticalZones: newCriticalZones,
      evidenceBundleVisible: showEvidence,
      ...(shouldAutoTrigger ? { centerTab: 'safety-loop', safetyLoopAutoTriggered: true } : {}),
    });
  },

  acknowledgeAlert: (id: string) => set(state => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a),
  })),

  addCopilotMessage: (msg: CopilotMessage) => set(state => ({
    copilotMessages: [...state.copilotMessages, msg],
  })),

  setCopilotLoading: (loading: boolean) => set({ copilotLoading: loading }),
  setSelectedZone: (zone: string | null) => set({ selectedZone: zone }),
  showEvidenceBundle: () => set({ evidenceBundleVisible: true }),
  hideEvidenceBundle: () => set({ evidenceBundleVisible: false }),
  toggleSoundMuted: () => set(state => ({ soundMuted: !state.soundMuted })),

  setCenterTab: (tab: '3d' | 'safety-loop') => set({ centerTab: tab }),

  executeIntervention: (id: string) => set(state => {
    const intervention = interventions.find(i => i.id === id);
    if (!intervention || state.executedInterventions.includes(id)) return {};

    const newIPLs = state.ipls.map(ipl =>
      ipl.id === intervention.fixesIplId
        ? { ...ipl, score: intervention.restoredScore, factors: intervention.restoredFactors }
        : ipl
    );

    const newPermits = intervention.suspendsPermits
      ? state.permits.map(p =>
          intervention.suspendsPermits!.includes(p.id) ? { ...p, status: 'suspended' as const } : p
        )
      : state.permits;

    const newCompoundRisk = calculateCompoundRisk(newIPLs);

    const executionAlert: Alert = {
      id: `intervention-${Date.now()}-${id}`,
      timestamp: state.scenarioTime,
      level: 'info',
      title: `INTERVENTION EXECUTED: ${intervention.title}`,
      description: `Executed by ${intervention.who}. Compound risk ${state.compoundRisk} → ${newCompoundRisk}. ${intervention.complianceNote}.`,
      zone: 'Z1',
      acknowledged: true,
    };

    return {
      ipls: newIPLs,
      permits: newPermits,
      compoundRisk: newCompoundRisk,
      alerts: [...state.alerts, executionAlert],
      executedInterventions: [...state.executedInterventions, id],
    };
  }),
}));

// Selector helpers
export const selectCompoundRisk = (state: KavachState) => state.compoundRisk;
export const selectIPLs = (state: KavachState) => state.ipls;
export const selectAlerts = (state: KavachState) => state.alerts;
export const selectSensorReadings = (state: KavachState) => state.sensorReadings;
export const selectWorkers = (state: KavachState) => state.workers;
export const selectCriticalZones = (state: KavachState) => state.criticalZones;
