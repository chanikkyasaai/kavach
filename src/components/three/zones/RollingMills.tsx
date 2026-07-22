import { Text, Billboard } from '@react-three/drei';

interface Props {
  critical: boolean;
}

const CENTER: [number, number, number] = [16, 0, 0];
const MILL_LABELS = ['LMMM', 'MMSM', 'WRM'];

/** Zone 5 — Rolling Mills, far east: LMMM, MMSM, WRM. */
export default function RollingMills({ critical }: Props) {
  return (
    <group position={CENTER}>
      {[-1.3, 0, 1.3].map((z, mi) => (
        <group key={mi} position={[0, 0, z]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[5, 1.0, 0.9]} />
            <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.45} />
          </mesh>
          {/* Roll stands along the mill */}
          {[-1.8, -0.6, 0.6, 1.8].map((x, ri) => (
            <mesh key={ri} position={[x, 0.5, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.2, 12]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
          <Billboard position={[-2.7, 1.15, 0]}>
            <Text fontSize={0.14} color={critical ? '#fca5a5' : '#94a3b8'} anchorX="left" anchorY="bottom" outlineWidth={0.005} outlineColor="#000000">
              {MILL_LABELS[mi]}
            </Text>
          </Billboard>
        </group>
      ))}

      {/* Coil storage stacks */}
      {[[3.4, -1], [3.4, 0], [3.4, 1], [3.9, -0.5], [3.9, 0.5]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.25, p[1]]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.4, 16]} />
          <meshStandardMaterial color="#71717a" metalness={0.65} roughness={0.4} />
        </mesh>
      ))}

      <Billboard position={[0, 1.7, 0]}>
        <Text fontSize={0.22} color={critical ? '#fca5a5' : '#94a3b8'} anchorX="center" anchorY="bottom" outlineWidth={0.008} outlineColor="#000000">
          ROLLING MILLS
        </Text>
      </Billboard>
    </group>
  );
}
