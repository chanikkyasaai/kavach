import { Text, Billboard } from '@react-three/drei';

interface Props {
  critical: boolean;
}

const CENTER: [number, number, number] = [-6, 0, 3];

/** Zone 6 — Sinter Plant, between the coke ovens and the blast furnace. */
export default function SinterPlant({ critical }: Props) {
  return (
    <group position={CENTER}>
      {/* Two large flat sintering machine buildings — weathered corrugated steel */}
      {[-0.9, 0.9].map((x, i) => (
        <mesh key={`sinter-bldg-${i}`} position={[x, 0.35, 0]} castShadow>
          <boxGeometry args={[1.5, 0.7, 2.2]} />
          <meshStandardMaterial color="#5a4d33" metalness={0.35} roughness={0.85} />
        </mesh>
      ))}
      {/* Ribbing for corrugated-roof detail */}
      {[-0.9, 0.9].map((x, i) => (
        Array.from({ length: 6 }).map((_, ri) => (
          <mesh key={`rib-${i}-${ri}`} position={[x, 0.71, -1.0 + ri * 0.4]}>
            <boxGeometry args={[1.48, 0.02, 0.04]} />
            <meshStandardMaterial color="#463c26" metalness={0.3} roughness={0.9} />
          </mesh>
        ))
      ))}

      {/* Dust collection towers */}
      {[-1.6, 1.6].map((x, i) => (
        <mesh key={`dust-${i}`} position={[x, 1.1, -0.9]} castShadow>
          <cylinderGeometry args={[0.22, 0.28, 1.6, 10]} />
          <meshStandardMaterial color="#5f6873" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}

      {/* Conveyor bridge toward the blast furnace (east) */}
      <mesh position={[3.2, 0.9, -0.6]} rotation={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[3.6, 0.15, 0.4]} />
        <meshStandardMaterial color="#333c47" metalness={0.6} roughness={0.5} />
      </mesh>

      <Billboard position={[0, 1.6, -1.6]}>
        <Text fontSize={0.18} color={critical ? '#fca5a5' : '#94a3b8'} anchorX="center" anchorY="bottom" outlineWidth={0.006} outlineColor="#000000">
          SINTER PLANT
        </Text>
      </Billboard>
    </group>
  );
}
