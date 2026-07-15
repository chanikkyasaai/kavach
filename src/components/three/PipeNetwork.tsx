import { useMemo } from 'react';
import * as THREE from 'three';

interface PipeData {
  start: [number, number, number];
  end: [number, number, number];
  radius: number;
  color: string;
}

const PIPES: PipeData[] = [
  // Gas main from BF to Melt Shop
  { start: [2, 0.8, -1], end: [0, 0.8, -1], radius: 0.04, color: '#f59e0b' },
  { start: [0, 0.8, -1], end: [0, 0.8, -2], radius: 0.04, color: '#f59e0b' },
  // Water cooling lines
  { start: [1, 0.3, 1.5], end: [1, 0.3, 2.5], radius: 0.025, color: '#06b6d4' },
  { start: [1.5, 0.3, 1.5], end: [1.5, 0.3, 2.5], radius: 0.025, color: '#06b6d4' },
  // Coke oven gas line
  { start: [-2, 0.6, 2], end: [-2, 0.6, 0], radius: 0.035, color: '#8b5cf6' },
  { start: [-2, 0.6, 0], end: [1, 0.6, 0], radius: 0.035, color: '#8b5cf6' },
  { start: [1, 0.6, 0], end: [2.5, 0.6, -0.5], radius: 0.035, color: '#8b5cf6' },
  // Steam lines
  { start: [-4, 1.5, 0], end: [-2, 1.5, 0], radius: 0.03, color: '#9ca3af' },
  { start: [-2, 1.5, 0], end: [-2, 1.5, -2], radius: 0.03, color: '#9ca3af' },
  // Compressed air
  { start: [3.5, 0.4, 0.5], end: [3.5, 0.4, -1], radius: 0.02, color: '#10b981' },
  // Sinter plant feed
  { start: [-4, 0.7, -0.5], end: [-2.5, 0.7, -1.5], radius: 0.05, color: '#6b7280' },
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
  if (Math.abs(dir.dot(up)) > 0.999) {
    // Nearly vertical — use a different reference
    quat.setFromUnitVectors(up, dir);
  } else {
    quat.setFromUnitVectors(up, dir);
  }

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
      {[[-1, 0, -1], [0, 0, -1], [1, 0, 0], [-2, 0, 1]].map((pos, i) => (
        <mesh key={`pylon-${i}`} position={[pos[0], 0.4, pos[2]]}>
          <boxGeometry args={[0.04, 0.8, 0.04]} />
          <meshStandardMaterial color="#2a3f5f" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* Valve wheels */}
      {[[-1, 0.8, -1], [1, 0.6, 0]].map((pos, i) => (
        <mesh key={`valve-${i}`} position={[pos[0], pos[1], pos[2]]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.012, 6, 12]} />
          <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
