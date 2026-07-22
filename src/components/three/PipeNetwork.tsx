import { useMemo } from 'react';
import * as THREE from 'three';

interface PipeData {
  start: [number, number, number];
  end: [number, number, number];
  radius: number;
  color: string;
}

// Process-flow spine (cyan) links the zones west→east in production order,
// plus a few zone-local utility runs (gas main, cooling, valves).
const PIPES: PipeData[] = [
  // Coke ovens → sinter → blast furnace → SMS → casting → rolling mills
  { start: [-11, 0.9, -1], end: [-6, 0.9, 3], radius: 0.035, color: '#06b6d4' },
  { start: [-6, 0.9, 3], end: [0, 0.9, -1], radius: 0.035, color: '#06b6d4' },
  { start: [0, 0.9, -1], end: [6.5, 0.9, 0], radius: 0.035, color: '#06b6d4' },
  { start: [6.5, 0.9, 0], end: [11, 0.9, 3], radius: 0.035, color: '#06b6d4' },
  { start: [11, 0.9, 3], end: [16, 0.9, 0], radius: 0.035, color: '#06b6d4' },

  // BF gas main → SMS
  { start: [1, 0.8, -2], end: [5, 0.8, -1], radius: 0.04, color: '#f59e0b' },

  // SMS cooling water lines
  { start: [11, 0.3, 2.5], end: [11, 0.3, 3.5], radius: 0.025, color: '#06b6d4' },
  { start: [11.5, 0.3, 2.5], end: [11.5, 0.3, 3.5], radius: 0.025, color: '#06b6d4' },

  // Coke oven gas line to blast furnace
  { start: [-11, 0.6, -1], end: [-6, 0.6, 0], radius: 0.035, color: '#8b5cf6' },
  { start: [-6, 0.6, 0], end: [0, 0.6, -1], radius: 0.035, color: '#8b5cf6' },

  // Compressed air to rolling mills
  { start: [11, 0.4, 3.5], end: [16, 0.4, 0.5], radius: 0.02, color: '#10b981' },

  // Sinter plant feed to blast furnace
  { start: [-6, 0.7, 1.5], end: [0, 0.7, -0.5], radius: 0.05, color: '#6b7280' },
];

function computePipeTransform(start: [number, number, number], end: [number, number, number]) {
  const s = new THREE.Vector3(...start);
  const e = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(e, s);
  const length = dir.length();
  const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);

  dir.normalize();
  const up = new THREE.Vector3(0, 1, 0);

  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(up, dir);

  return { position: mid, quaternion: quat, length };
}

export default function PipeNetwork() {
  const pipeTransforms = useMemo(() =>
    PIPES.map(p => ({
      ...p,
      transform: computePipeTransform(p.start, p.end),
    })), []);

  return (
    <group>
      {pipeTransforms.map((pipe, i) => (
        <group key={i}>
          {/* Pipe body */}
          <mesh
            position={[pipe.transform.position.x, pipe.transform.position.y, pipe.transform.position.z]}
            quaternion={pipe.transform.quaternion}
          >
            <cylinderGeometry args={[pipe.radius, pipe.radius, pipe.transform.length, 8]} />
            <meshStandardMaterial
              color={pipe.color}
              metalness={0.8}
              roughness={0.3}
              transparent
              opacity={0.7}
            />
          </mesh>
          {/* Joint at start */}
          <mesh position={pipe.start}>
            <sphereGeometry args={[pipe.radius * 1.3, 8, 8]} />
            <meshStandardMaterial color={pipe.color} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Pipe support pylons */}
      {[[-8, 0, 1], [-3, 0, -1], [3, 0, -1], [8.5, 0, 1.5], [13.5, 0, 1.5]].map((pos, i) => (
        <mesh key={`pylon-${i}`} position={[pos[0], 0.4, pos[2]]}>
          <boxGeometry args={[0.04, 0.8, 0.04]} />
          <meshStandardMaterial color="#2a3f5f" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* Valve wheels */}
      {[[1, 0.8, -2], [6.5, 0.6, 0]].map((pos, i) => (
        <mesh key={`valve-${i}`} position={[pos[0], pos[1], pos[2]]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.012, 6, 12]} />
          <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
