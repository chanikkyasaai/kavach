import { seededRange } from '../proceduralUtils';

/**
 * Zone 1 — Raw Material Handling Plant. Pure backdrop (not a scored IPL zone,
 * not referenced by sensors/workers/permits) — establishes the west edge of
 * the process flow: port → stockpiles → conveyors → coke ovens.
 */
export default function RMHP() {
  const originX = -17;

  // A dense, low, tightly-clustered stockyard reads correctly — isolated
  // spheres do not. Generate an irregular cluster per material pile.
  const piles: { x: number; z: number; color: string; count: number }[] = [
    { x: -1.6, z: -2.3, color: '#232323', count: 5 }, // coal
    { x: 0.4, z: -2.0, color: '#5c4a3a', count: 4 },  // iron ore
    { x: -0.9, z: -0.1, color: '#6b6b64', count: 5 }, // limestone
    { x: 1.1, z: 0.4, color: '#4a4132', count: 4 },   // dolomite
  ];

  return (
    <group position={[originX, 0, 1]}>
      {piles.map((pile, pi) => (
        <group key={pi} position={[pile.x, 0, pile.z]}>
          {Array.from({ length: pile.count }).map((_, i) => {
            const seed = pi * 20 + i;
            const ox = seededRange(seed, -0.55, 0.55);
            const oz = seededRange(seed + 1, -0.5, 0.5);
            const r = seededRange(seed + 2, 0.45, 0.75);
            return (
              <mesh key={i} position={[ox, 0, oz]} scale={[1, 0.32, 1]} castShadow>
                <sphereGeometry args={[r, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={pile.color} metalness={0.05} roughness={0.98} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Conveyors running toward the coke ovens (east) */}
      {[1.5, 2.2].map((z, i) => (
        <mesh key={`conv-${i}`} position={[1.5, 0.35, z]} rotation={[0, 0, 0.02]} castShadow>
          <boxGeometry args={[6, 0.12, 0.35]} />
          <meshStandardMaterial color="#3a4452" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {[0.9, 1.1].map((z, i) => (
        <mesh key={`convleg-${i}`} position={[1.5, 0.15, z === 0.9 ? 1.5 : 2.2]}>
          <boxGeometry args={[6, 0.02, 0.02]} />
          <meshStandardMaterial color="#5c6b7a" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* Wagon tippler structure */}
      <group position={[-2, 0, 1.5]}>
        {[[-0.6, -0.5], [0.6, -0.5], [-0.6, 0.5], [0.6, 0.5]].map((p, i) => (
          <mesh key={`tip-${i}`} position={[p[0], 1, p[1]]}>
            <boxGeometry args={[0.08, 2, 0.08]} />
            <meshStandardMaterial color="#7d8ea3" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[1.4, 0.08, 1.2]} />
          <meshStandardMaterial color="#5c6b7a" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* Ground pad */}
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#232b38" metalness={0.1} roughness={0.95} />
      </mesh>
    </group>
  );
}
