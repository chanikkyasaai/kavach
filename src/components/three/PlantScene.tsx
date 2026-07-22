import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { zones } from '../../data/zones';
import { sensors } from '../../data/sensors';
import { equipment } from '../../data/equipment';
import ZonePlate from './ZonePlate';
import SensorNode from './SensorNode';
import WorkerDot from './WorkerDot';
import EquipmentBlock from './EquipmentBlock';
import VSPPlant from './zones/VSPPlant';
import ParticleSystem from './ParticleSystem';
import PipeNetwork from './PipeNetwork';
import SimopsBeam from './SimopsBeam';
import { usePlantData } from './usePlantData';
import type { StoreType } from './usePlantData';

interface Props {
  storeType?: StoreType;
}

export default function PlantScene({ storeType = 'live' }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const data = usePlantData(storeType);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.0003) * 0.008;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Industrial concrete floor — spans the full west→east VSP layout */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 1]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial
          color="#090c0f"
          metalness={0.1}
          roughness={0.92}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* Subtle grid lines on floor */}
      {Array.from({ length: 22 }).map((_, i) => {
        const pos = -20 + i * 2;
        return (
          <group key={`grid-${i}`}>
            <mesh position={[pos, 0.001, 1]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.01, 22]} />
              <meshBasicMaterial color="#3d5066" transparent opacity={0.25} />
            </mesh>
            <mesh position={[0, 0.001, pos + 1]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[0.01, 42]} />
              <meshBasicMaterial color="#3d5066" transparent opacity={0.25} />
            </mesh>
          </group>
        );
      })}

      {/* Zone floor plates with glow */}
      {zones.map(zone => (
        <ZonePlate
          key={zone.id}
          zone={zone}
          isCritical={data.criticalZones.includes(zone.id)}
        />
      ))}

      {/* Real VSP plant reconstruction — 7 zones + support infrastructure */}
      <VSPPlant criticalZones={data.criticalZones} />

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
          reading={data.sensorReadings[sensor.id]}
        />
      ))}

      {/* Worker dots */}
      {data.workers.map(worker => (
        <WorkerDot
          key={worker.id}
          worker={worker}
          isCriticalZone={data.criticalZones.includes(worker.zone)}
        />
      ))}

      {/* Particle effects */}
      <ParticleSystem criticalZones={data.criticalZones} compoundRisk={data.compoundRisk} />

      {/* SIMOPS CONFLICT — massive hazard indicator over SMS */}
      <SimopsBeam active={data.simopsConflicts.length > 0} />
    </group>
  );
}
