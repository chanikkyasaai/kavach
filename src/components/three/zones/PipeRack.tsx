import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  start: [number, number, number];
  end: [number, number, number];
  deckHeight?: number;
  pipeCount?: number;
}

const PIPE_COLORS = ['#f59e0b', '#06b6d4', '#8b5cf6', '#10b981'];

/** Elevated pipe rack / gantry — the trestle-supported bundle of process
 *  pipes that visually dominates the space between real plant zones. */
export default function PipeRack({ start, end, deckHeight = 1.0, pipeCount = 3 }: Props) {
  const { angle, length, midX, midZ, midY } = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(e, s);
    const len = Math.hypot(dir.x, dir.z);
    const mid = s.clone().add(e).multiplyScalar(0.5);
    return { angle: Math.atan2(dir.x, dir.z), length: len, midX: mid.x, midZ: mid.z, midY: Math.min(s.y, e.y) };
  }, [start, end]);

  const trestleCount = Math.max(2, Math.floor(length / 2.2));
  const pipeOffsets = Array.from({ length: pipeCount }, (_, i) =>
    pipeCount > 1 ? -0.25 + (0.5 / (pipeCount - 1)) * i : 0
  );

  return (
    <group position={[midX, midY, midZ]} rotation={[0, angle, 0]}>
      {Array.from({ length: trestleCount + 1 }).map((_, i) => {
        const zLocal = (i / trestleCount - 0.5) * length;
        return (
          <group key={i} position={[0, 0, zLocal]}>
            {[-0.35, 0.35].map((x, li) => (
              <mesh key={li} position={[x, deckHeight / 2, 0]} castShadow>
                <boxGeometry args={[0.05, deckHeight, 0.05]} />
                <meshStandardMaterial color="#3f4a58" metalness={0.7} roughness={0.5} />
              </mesh>
            ))}
            <mesh position={[0, deckHeight, 0]}>
              <boxGeometry args={[0.82, 0.04, 0.04]} />
              <meshStandardMaterial color="#3f4a58" metalness={0.7} roughness={0.5} />
            </mesh>
          </group>
        );
      })}

      {pipeOffsets.map((xOff, pi) => (
        <mesh key={pi} position={[xOff, deckHeight + 0.09, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, length, 8]} />
          <meshStandardMaterial color={PIPE_COLORS[pi % PIPE_COLORS.length]} metalness={0.75} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}
