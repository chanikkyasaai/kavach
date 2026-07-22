import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  start: [number, number, number];
  end: [number, number, number];
  width?: number;
}

/** Enclosed, elevated, angled conveyor gallery on truss legs — the belt
 *  structures that visually dominate the ground between RMHP/Sinter and
 *  the Blast Furnace on a real integrated steel plant. */
export default function ConveyorBridge({ start, end, width = 0.5 }: Props) {
  const { quat, length, midX, midY, midZ, dirN } = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(e, s);
    const len = dir.length();
    const mid = s.clone().add(e).multiplyScalar(0.5);
    const n = dir.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    return { quat: q, length: len, midX: mid.x, midY: mid.y, midZ: mid.z, dirN: n };
  }, [start, end]);

  const ribCount = Math.max(2, Math.floor(length / 0.6));
  const legCount = Math.max(2, Math.floor(length / 2));

  return (
    <group>
      {/* Enclosed gallery */}
      <mesh position={[midX, midY, midZ]} quaternion={quat} castShadow>
        <boxGeometry args={[width, width * 0.7, length]} />
        <meshStandardMaterial color="#333c47" metalness={0.55} roughness={0.55} />
      </mesh>

      {/* Ribbing for a segmented, enclosed-gallery read */}
      {Array.from({ length: ribCount }).map((_, i) => {
        const t = (i + 0.5) / ribCount - 0.5;
        const x = midX + dirN.x * t * length;
        const y = midY + dirN.y * t * length;
        const z = midZ + dirN.z * t * length;
        return (
          <mesh key={i} position={[x, y, z]} quaternion={quat}>
            <boxGeometry args={[width + 0.03, width * 0.72, 0.03]} />
            <meshStandardMaterial color="#262e38" metalness={0.5} roughness={0.6} />
          </mesh>
        );
      })}

      {/* Truss support legs, stepping in height along the incline */}
      {Array.from({ length: legCount + 1 }).map((_, i) => {
        const t = i / legCount;
        const x = start[0] + (end[0] - start[0]) * t;
        const z = start[2] + (end[2] - start[2]) * t;
        const topY = start[1] + (end[1] - start[1]) * t;
        return (
          <mesh key={i} position={[x, topY / 2, z]}>
            <boxGeometry args={[0.06, Math.max(0.15, topY), 0.06]} />
            <meshStandardMaterial color="#3f4a58" metalness={0.6} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}
