import { Text, Billboard } from '@react-three/drei';

interface Props {
  critical: boolean;
}

const CENTER: [number, number, number] = [11, 0, 3];

/** Zone 4 — Continuous Casting, directly east of and connected to SMS. */
export default function ContinuousCasting({ critical }: Props) {
  return (
    <group position={CENTER}>
      {/* Long, lower-profile building */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[3.6, 1.1, 1.8]} />
        <meshStandardMaterial color="#4b5563" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Casting strand lines — long thin floor-level structures */}
      {[-0.5, 0, 0.5].map((z, i) => (
        <mesh key={i} position={[0, 0.08, z]}>
          <boxGeometry args={[3.4, 0.05, 0.12]} />
          <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      <Billboard position={[0, 1.3, 0]}>
        <Text fontSize={0.16} color={critical ? '#fca5a5' : '#94a3b8'} anchorX="center" anchorY="bottom" outlineWidth={0.006} outlineColor="#000000">
          CONTINUOUS CASTING
        </Text>
      </Billboard>
    </group>
  );
}
