import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';
import { seededRange } from '../proceduralUtils';

interface Props {
  critical: boolean;
}

const CENTER: [number, number, number] = [6.5, 0, 0];
const SHOP_Z = [-1.7, 0, 1.7];
const SHOP_LABELS = ['SMS-1', 'SMS-2', 'SMS-3'];

/**
 * Zone 1 — Steel Melt Shop. THE ACCIDENT ZONE — the June 8, 2026 explosion
 * occurred here. Highest sensor density of any zone. SMS-1's ladle bay is
 * the specific incident location and is marked distinctly.
 */
export default function SMS({ critical }: Props) {
  const ladleGlowRef = useRef<THREE.Mesh>(null);
  const trolleyRefs = useRef<THREE.Group[]>([]);
  const hookRefs = useRef<THREE.Group[]>([]);

  useFrame(() => {
    const t = Date.now() * 0.001;
    if (ladleGlowRef.current) {
      const mat = ladleGlowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = critical ? 0.9 + Math.sin(t * 5) * 0.4 : 0.4 + Math.sin(t * 1.5) * 0.15;
    }
    trolleyRefs.current.forEach((trolley, i) => {
      if (!trolley) return;
      trolley.position.x = Math.sin(t * 0.25 + i * 2.1) * 2.4;
    });
    hookRefs.current.forEach((hook, i) => {
      if (!hook) return;
      hook.rotation.z = Math.sin(t * 0.6 + i * 1.4) * 0.05;
    });
  });

  return (
    <group position={CENTER}>
      {SHOP_Z.map((z, si) => (
        <group key={`sms-${si}`} position={[0, 0, z]}>
          {/* Shop building shell — weathered structural steel */}
          <mesh position={[0, 1.3, 0]}>
            <boxGeometry args={[6.4, 2.4, 1.5]} />
            <meshStandardMaterial color="#333c47" metalness={0.5} roughness={0.65} transparent opacity={0.24} side={THREE.DoubleSide} />
          </mesh>
          {/* Structural columns */}
          {[-3, -1, 1, 3].map((x, ci) => (
            <mesh key={ci} position={[x, 1.2, 0]}>
              <boxGeometry args={[0.09, 2.4, 0.09]} />
              <meshStandardMaterial color="#6b7688" metalness={0.8} roughness={0.35} />
            </mesh>
          ))}
          {/* Diagonal bracing — adds structural density */}
          {[-2, 0, 2].map((x, bi) => (
            <mesh key={bi} position={[x, 1.8, 0]} rotation={[0, 0, Math.PI / 5]}>
              <boxGeometry args={[0.04, 1.4, 0.04]} />
              <meshStandardMaterial color="#525c69" metalness={0.7} roughness={0.4} />
            </mesh>
          ))}

          {/* Overhead crane spanning the shop width, with hanging hook + ladle */}
          <group>
            <mesh position={[0, 2.15, 0]}>
              <boxGeometry args={[6.2, 0.08, 0.2]} />
              <meshStandardMaterial color="#c99a1e" metalness={0.55} roughness={0.4} />
            </mesh>
            {[-2.8, 2.8].map((x, ei) => (
              <mesh key={ei} position={[x, 2.1, 0]}>
                <boxGeometry args={[0.12, 0.3, 0.12]} />
                <meshStandardMaterial color="#c99a1e" metalness={0.55} roughness={0.4} />
              </mesh>
            ))}
            <group ref={el => { if (el) trolleyRefs.current[si] = el; }} position={[0, 2.1, 0]}>
              <mesh>
                <boxGeometry args={[0.3, 0.12, 0.18]} />
                <meshStandardMaterial color="#3f3f46" metalness={0.6} roughness={0.4} />
              </mesh>
              <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.7, 4]} />
                <meshStandardMaterial color="#8b8f97" metalness={0.8} roughness={0.3} />
              </mesh>
              <group ref={el => { if (el) hookRefs.current[si] = el; }} position={[0, -0.78, 0]}>
                {/* Hanging ladle */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.16, 0.22, 0.32, 12]} />
                  <meshStandardMaterial color="#5a4a1f" metalness={0.7} roughness={0.4} />
                </mesh>
                <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.14, 12]} />
                  <meshBasicMaterial color="#ff5500" transparent opacity={0.55} side={THREE.DoubleSide} />
                </mesh>
              </group>
            </group>
          </group>

          {/* LD converter — truncated-cone tilting vessel */}
          <mesh position={[-2, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.42, 1.0, 16]} />
            <meshStandardMaterial color="#8a4a24" metalness={0.65} roughness={0.5} />
          </mesh>
          <mesh position={[-2, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.44, 0.03, 8, 20]} />
            <meshStandardMaterial color="#7d8ea3" metalness={0.85} roughness={0.3} />
          </mesh>

          {/* Ladle treatment station — circular platform */}
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.06, 20]} />
            <meshStandardMaterial color="#41474f" metalness={0.6} roughness={0.55} />
          </mesh>
          <mesh
            ref={si === 0 ? ladleGlowRef : undefined}
            position={[0, 0.1, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.32, 16]} />
            <meshStandardMaterial color="#3a0f00" emissive="#ff6600" emissiveIntensity={0.4} side={THREE.DoubleSide} />
          </mesh>

          {/* Continuous caster hint (strand line toward east exit) */}
          <mesh position={[2.4, 0.1, 0]}>
            <boxGeometry args={[1.6, 0.05, 0.15]} />
            <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.4} />
          </mesh>

          {/* Piping / ductwork clutter for visual density */}
          {Array.from({ length: 4 }).map((_, ci) => {
            const seed = si * 40 + ci;
            const x = seededRange(seed, -2.8, 2.8);
            return (
              <mesh key={ci} position={[x, seededRange(seed + 1, 0.2, 0.6), 0.68]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, seededRange(seed + 2, 0.4, 1.0), 6]} />
                <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.4} />
              </mesh>
            );
          })}

          <Billboard position={[0, 2.55, 0]}>
            <Text fontSize={0.16} color={critical ? '#fca5a5' : '#cbd5e1'} anchorX="center" anchorY="bottom" outlineWidth={0.006} outlineColor="#000000">
              {SHOP_LABELS[si]}
            </Text>
          </Billboard>

          {/* Incident location marker — SMS-1 ladle bay only */}
          {si === 0 && (
            <Billboard position={[0, 0.9, 0]}>
              <Text
                fontSize={0.09}
                color="#fca5a5"
                anchorX="center"
                anchorY="bottom"
                outlineWidth={0.004}
                outlineColor="#000000"
              >
                ⚠ LADLE BAY — INCIDENT LOCATION (JUN 8, 2026)
              </Text>
            </Billboard>
          )}
        </group>
      ))}

      {critical && (
        <pointLight position={[0, 2, 0]} color="#ff2200" intensity={4} distance={8} decay={2} />
      )}
    </group>
  );
}
