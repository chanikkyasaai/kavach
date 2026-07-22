import RMHP from './RMHP';
import CokeOvens from './CokeOvens';
import SinterPlant from './SinterPlant';
import BlastFurnace from './BlastFurnace';
import SMS from './SMS';
import ContinuousCasting from './ContinuousCasting';
import RollingMills from './RollingMills';
import SupportInfra from './SupportInfra';
import RailNetwork from './RailNetwork';
import PipeRack from './PipeRack';
import ConveyorBridge from './ConveyorBridge';
import SiteDetails from './SiteDetails';

interface Props {
  criticalZones: string[];
}

/**
 * The full VSP plant reconstruction, composed from the 7 real production
 * zones (west→east: RMHP → Coke Ovens → Sinter → Blast Furnace → SMS →
 * Continuous Casting → Rolling Mills) plus supporting infrastructure and
 * the connecting infrastructure (pipe racks, conveyors, rail) that visually
 * dominates a real integrated steel plant site.
 * Zone IDs match zones.ts so criticality flows from the same store data
 * that drives sensors, workers, and permits.
 */
export default function VSPPlant({ criticalZones }: Props) {
  return (
    <group>
      <RMHP />
      <CokeOvens critical={criticalZones.includes('Z3')} />
      <SinterPlant critical={criticalZones.includes('Z6')} />
      <BlastFurnace critical={criticalZones.includes('Z2')} />
      <SMS critical={criticalZones.includes('Z1')} />
      <ContinuousCasting critical={criticalZones.includes('Z4')} />
      <RollingMills critical={criticalZones.includes('Z5')} />
      <SupportInfra />
      <RailNetwork />
      <SiteDetails />

      {/* Conveyor galleries — raw material flow west→east */}
      <ConveyorBridge start={[-14.5, 0.4, 2]} end={[-12, 1.05, -1.6]} />
      <ConveyorBridge start={[-14.5, 0.4, 1.5]} end={[-7.5, 0.95, 2.6]} />
      <ConveyorBridge start={[-4.5, 1.0, 1.2]} end={[-2, 1.3, -0.6]} />

      {/* Elevated pipe racks — gas/process lines between zones */}
      <PipeRack start={[-8, 1.3, -1]} end={[-3, 1.4, -1]} pipeCount={3} />
      <PipeRack start={[2.5, 1.6, -1]} end={[4.8, 1.4, 0]} pipeCount={2} />
      <PipeRack start={[9.2, 1.0, 0]} end={[10.5, 1.0, 2.2]} pipeCount={2} />
      <PipeRack start={[12.5, 1.0, 2.2]} end={[14, 1.0, 0]} pipeCount={2} />
    </group>
  );
}
