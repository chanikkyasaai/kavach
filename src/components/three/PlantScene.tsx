import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { zones } from '../../data/zones';
import { sensors } from '../../data/sensors';
import { equipment } from '../../data/equipment';
import ZonePlate from './ZonePlate';
import SensorNode from './SensorNode';
import WorkerDot from './WorkerDot';
import EquipmentBlock from './EquipmentBlock';
import SteelPlantStructures from './SteelPlantStructures';
import ParticleSystem from './ParticleSystem';
import PipeNetwork from './PipeNetwork';
import SimopsBeam from './SimopsBeam';

export default function PlantScene() {
  const groupRef = useRef<THREE.Group>(null);
  const criticalZones = useStore(s => s.criticalZones);
  const workerData = useStore(s => s.workers);
  const sensorReadings = useStore(s => s.sensorReadings);
  const compoundRisk = useStore(s => s.compoundRisk);
  const simopsConflicts = useStore(s => s.simopsConflicts);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.0003) * 0.008;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Industrial concrete floor — visible light grey */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial
          color="#2a3444"
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      {/* Subtle grid lines on floor */}
      {Array.from({ length: 11 }).map((_, i) => {
        const pos = -5 + i;
        return (
          <group key={`grid-${i}`}>
            <mesh position={[pos, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.01, 22]} />
              <meshBasicMaterial color="#3d5066" transparent opacity={0.3} />
            </mesh>
            <mesh position={[0, 0.001, pos]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[0.01, 22]} />
              <meshBasicMaterial color="#3d5066" transparent opacity={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Zone floor plates with glow */}
      {zones.map(zone => (
        <ZonePlate
          key={zone.id}
          zone={zone}
          isCritical={criticalZones.includes(zone.id)}
        />
      ))}

      {/* Steel plant structural elements */}
      <SteelPlantStructures criticalZones={criticalZones} />

      {/* Pipe network */}
      <PipeNetwork />

      {/* Equipment blocks */}
      {equipment.map(eq => (
        <EquipmentBlock key={eq.id} equipment={eq} />
      ))}

      {/* Sensor nodes */}
      {sensors.map(sensor => (
        <SensorNode
          key={sensor.id}
          sensor={sensor}
          reading={sensorReadings[sensor.id]}
        />
      ))}

      {/* Worker dots */}
      {workerData.map(worker => (
        <WorkerDot
          key={worker.id}
          worker={worker}
          isCriticalZone={criticalZones.includes(worker.zone)}
        />
      ))}

      {/* Particle effects */}
      <ParticleSystem criticalZones={criticalZones} compoundRisk={compoundRisk} />

      {/* SIMOPS CONFLICT — massive red hazard indicator */}
      <SimopsBeam active={simopsConflicts.length > 0} />
    </group>
  );
}
