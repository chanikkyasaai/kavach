import { useStore } from '../../store/useStore';
import { useSimulationStore } from '../../store/simulationStore';
import type { SensorReading } from '../../store/useStore';
import { sensors } from '../../data/sensors';
import { workers as allWorkers } from '../../data/workers';
import type { Worker } from '../../data/workers';

export type StoreType = 'live' | 'simulation';

export interface PlantSceneData {
  compoundRisk: number;
  criticalZones: string[];
  workers: Worker[];
  sensorReadings: Record<string, SensorReading>;
  simopsConflicts: string[];
}

const SIM_SENSOR_MAP: Record<string, keyof ReturnType<typeof useSimulationStore.getState>['variables']> = {
  S01: 'CO_GAS_READING',
  S07: 'FLAMMABLE_GAS_READING',
  S09: 'LADLE_PRESSURE',
};

/** Adapts either the live plant store or the simulation store into the shape
 *  the 3D scene needs, so PlantScene/BowTie render identically regardless of
 *  which store is driving them (storeType prop pattern). */
export function usePlantData(storeType: StoreType): PlantSceneData {
  const live = useStore();
  const sim = useSimulationStore();

  if (storeType === 'live') {
    return {
      compoundRisk: live.compoundRisk,
      criticalZones: live.criticalZones,
      workers: live.workers,
      sensorReadings: live.sensorReadings,
      simopsConflicts: live.simopsConflicts,
    };
  }

  const simSensorReadings: Record<string, SensorReading> = {};
  sensors.forEach(s => {
    const varKey = SIM_SENSOR_MAP[s.id];
    const value = varKey ? (sim.variables[varKey] as number) : s.baseline;
    simSensorReadings[s.id] = { id: s.id, value, rateOfChange: 0, history: Array(60).fill(value) };
  });

  const z1Live = allWorkers.filter(w => w.zone === 'Z1');
  const z1Count = Math.round(sim.variables.WORKERS_IN_ZONE);
  const simWorkers: Worker[] = [
    ...z1Live.slice(0, z1Count),
    ...allWorkers.filter(w => w.zone !== 'Z1'),
  ];

  const criticalZones: string[] = [];
  if (sim.compoundRisk >= 60) criticalZones.push('Z1');
  if (sim.compoundRisk >= 85) criticalZones.push('Z2');

  return {
    compoundRisk: sim.compoundRisk,
    criticalZones,
    workers: simWorkers,
    sensorReadings: simSensorReadings,
    simopsConflicts: sim.variables.SIMOPS_CONFLICTS_ACTIVE > 0
      ? ['PTW-437 × PTW-438: Hot Work + Confined Space in Z1 (simulated)']
      : [],
  };
}
