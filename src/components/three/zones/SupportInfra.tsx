import { Text, Billboard } from '@react-three/drei';
import CoolingTower from './CoolingTower';

/**
 * Supporting infrastructure rendered at lower detail: Captive Power Plant,
 * Air Separation Plant, the Oxygen Plant (site of the 2012 VSP explosion —
 * marked distinctly, with a newer/well-maintained finish contrasting the
 * rest of the weathered plant), and water treatment (MBC plant).
 */
export default function SupportInfra() {
  return (
    <group>
      {/* Captive Power Plant */}
      <group position={[-2, 0, 8]}>
        {[-0.9, 0.9].map((x, i) => (
          <mesh key={i} position={[x, 0.9, 0]} castShadow>
            <boxGeometry args={[0.9, 1.8, 1.2]} />
            <meshStandardMaterial color="#454d57" metalness={0.6} roughness={0.55} />
          </mesh>
        ))}
        <CoolingTower position={[0, 0.75, 1.6]} />
        <Billboard position={[0, 2, 0]}>
          <Text fontSize={0.13} color="#94a3b8" anchorX="center" anchorY="bottom" outlineWidth={0.005} outlineColor="#000000">
            CAPTIVE POWER PLANT
          </Text>
        </Billboard>
      </group>

      {/* Secondary cooling tower — SMS / continuous-casting cooling water */}
      <CoolingTower position={[9.5, 0.6, 5.5]} scale={0.75} />

      {/* Air Separation Plant */}
      <group position={[7, 0, 6]}>
        {[-0.3, 0, 0.3, 0.6].map((x, i) => (
          <mesh key={i} position={[x, 0.6 + (i % 2) * 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 1.2 + (i % 2) * 0.3, 10]} />
            <meshStandardMaterial color="#7d8ea3" metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
        <Billboard position={[0.15, 1.4, 0]}>
          <Text fontSize={0.1} color="#94a3b8" anchorX="center" anchorY="bottom" outlineWidth={0.004} outlineColor="#000000">
            ASP
          </Text>
        </Billboard>
      </group>

      {/* Oxygen Plant — site of the 2012 VSP explosion (19 dead). Marked, and
          rendered with a cleaner low-roughness finish — visually distinct
          from the weathered structures around it. */}
      <group position={[4.6, 0, 6.6]}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 1.4, 16]} />
          <meshStandardMaterial color="#c3ccd6" metalness={0.85} roughness={0.22} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <Billboard position={[0, 1.65, 0]}>
          <Text fontSize={0.08} color="#fbbf24" anchorX="center" anchorY="bottom" outlineWidth={0.004} outlineColor="#000000">
            ⚠ OXYGEN PLANT — 2012 INCIDENT SITE
          </Text>
        </Billboard>
      </group>

      {/* Water treatment (MBC plant) — south boundary */}
      <group position={[1, 0, 9.6]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[1.6, 0.5, 1.0]} />
          <meshStandardMaterial color="#333c47" metalness={0.4} roughness={0.75} />
        </mesh>
        <Billboard position={[0, 0.65, 0]}>
          <Text fontSize={0.1} color="#94a3b8" anchorX="center" anchorY="bottom" outlineWidth={0.004} outlineColor="#000000">
            WATER TREATMENT (MBC)
          </Text>
        </Billboard>
      </group>
    </group>
  );
}
