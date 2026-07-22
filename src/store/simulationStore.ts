import { create } from 'zustand';
import { useStore } from './useStore';
import {
  propagateCausalGraph,
  getLiveDefaultVariables,
  cascadeFromStaffing,
  cascadeFromMaintenanceBudget,
  cascadeFromCompliance,
} from '../utils/causalEngine';
import type { SimulationVariables } from '../utils/causalEngine';
import { simulationPresets } from '../data/simulationPresets';
import { getTimelineSensorValueAt, getTimelineSimopsConflictsAt, RUN_FORWARD_SPEED, RUN_FORWARD_DURATION_MINUTES } from '../utils/runForward';

// Independent of the live IPL objects — the sandbox never mutates plantStore state directly.
const IPL_META = [
  { id: 'ipl1', name: 'Basic Process Control (BPCS)', shortName: 'BPCS' },
  { id: 'ipl2', name: 'Safety Instrumented System (SIS)', shortName: 'SIS' },
  { id: 'ipl3', name: 'Administrative Controls (PTW)', shortName: 'PTW' },
  { id: 'ipl4', name: 'Mechanical Integrity', shortName: 'MECH' },
  { id: 'ipl5', name: 'Human Factors (Workforce)', shortName: 'HF' },
];

export interface RunForwardPoint {
  time: number;
  compoundRisk: number;
}

interface SimulationState {
  variables: SimulationVariables;
  iplScores: Record<string, number>;
  compoundRisk: number;
  activePresetId: string | null;
  initialized: boolean;

  isRunningForward: boolean;
  runForwardTime: number;
  runForwardHistory: RunForwardPoint[];
  runForwardBaselineSimops: number;

  initFromLive: () => void;
  setVariable: (id: keyof SimulationVariables, value: number) => void;
  loadPreset: (presetId: string) => void;

  startRunForward: () => void;
  pauseRunForward: () => void;
  resetRunForward: () => void;
  tickRunForward: () => void;

  pushToLive: () => void;
}

function scoreAndRisk(variables: SimulationVariables) {
  return propagateCausalGraph(variables, IPL_META);
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  variables: simulationPresets[0].variables,
  iplScores: {},
  compoundRisk: 0,
  activePresetId: null,
  initialized: false,

  isRunningForward: false,
  runForwardTime: 0,
  runForwardHistory: [],
  runForwardBaselineSimops: 0,

  initFromLive: () => {
    if (get().initialized) return;
    const live = useStore.getState();
    const z1Count = live.workers.filter(w => w.zone === 'Z1').length;
    const variables = getLiveDefaultVariables(live.ipls, live.sensorReadings, live.simopsConflicts.length, z1Count);
    const { iplScores, compoundRisk } = scoreAndRisk(variables);
    set({ variables, iplScores, compoundRisk, activePresetId: null, initialized: true, runForwardBaselineSimops: variables.SIMOPS_CONFLICTS_ACTIVE });
  },

  setVariable: (id, value) => set(state => {
    const newVars: SimulationVariables = { ...state.variables, [id]: value };
    if (id === 'STAFFING_RATIO') Object.assign(newVars, cascadeFromStaffing(value));
    if (id === 'MAINTENANCE_BUDGET') Object.assign(newVars, cascadeFromMaintenanceBudget(value));
    if (id === 'PTW_COMPLIANCE_RATE') Object.assign(newVars, cascadeFromCompliance(value));
    const { iplScores, compoundRisk } = scoreAndRisk(newVars);
    return { variables: newVars, iplScores, compoundRisk, activePresetId: null };
  }),

  loadPreset: (presetId) => set(() => {
    const preset = simulationPresets.find(p => p.id === presetId);
    if (!preset) return {};
    const variables = { ...preset.variables };
    const { iplScores, compoundRisk } = scoreAndRisk(variables);
    return {
      variables, iplScores, compoundRisk, activePresetId: presetId, initialized: true,
      isRunningForward: false, runForwardTime: 0, runForwardHistory: [],
      runForwardBaselineSimops: variables.SIMOPS_CONFLICTS_ACTIVE,
    };
  }),

  startRunForward: () => set(state => ({
    isRunningForward: true,
    // Only capture a fresh baseline when starting from T+0 — resuming after a
    // pause shouldn't re-arm it (pre-existing conflicts stay pre-existing).
    runForwardBaselineSimops: state.runForwardTime === 0 ? state.variables.SIMOPS_CONFLICTS_ACTIVE : state.runForwardBaselineSimops,
  })),
  pauseRunForward: () => set({ isRunningForward: false }),

  resetRunForward: () => set(state => {
    const preset = simulationPresets.find(p => p.id === state.activePresetId);
    const variables = preset ? { ...preset.variables } : state.variables;
    const { iplScores, compoundRisk } = scoreAndRisk(variables);
    return {
      variables, iplScores, compoundRisk, isRunningForward: false, runForwardTime: 0, runForwardHistory: [],
      runForwardBaselineSimops: variables.SIMOPS_CONFLICTS_ACTIVE,
    };
  }),

  tickRunForward: () => {
    const state = get();
    if (!state.isRunningForward) return;

    const newTime = Math.min(state.runForwardTime + (RUN_FORWARD_SPEED * 0.5) / 60, RUN_FORWARD_DURATION_MINUTES);
    const co = getTimelineSensorValueAt('S01', newTime, state.variables.CO_GAS_READING);
    // Pre-existing conflicts (from the preset/user edits) persist; the timeline
    // can only ever escalate the count further, never silently clear it.
    const simopsConflicts = Math.max(state.runForwardBaselineSimops, getTimelineSimopsConflictsAt(newTime));
    const variables: SimulationVariables = { ...state.variables, CO_GAS_READING: co, SIMOPS_CONFLICTS_ACTIVE: simopsConflicts };
    const { iplScores, compoundRisk } = scoreAndRisk(variables);
    const done = newTime >= RUN_FORWARD_DURATION_MINUTES;

    set({
      runForwardTime: newTime,
      variables,
      iplScores,
      compoundRisk,
      runForwardHistory: [...state.runForwardHistory, { time: newTime, compoundRisk }],
      isRunningForward: !done,
    });
  },

  pushToLive: () => {
    useStore.getState().applySimulatedConditions(get().iplScores);
  },
}));

export const IPL_META_LIST = IPL_META;
