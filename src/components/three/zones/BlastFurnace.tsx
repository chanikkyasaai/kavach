import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';
import { seededRange } from '../proceduralUtils';

interface Props {
  critical: boolean;
}

const CENTER: [number, number, number] = [0, 0, -1];
const FURNACE_Z = [-2.2, 0, 2.2];
const FURNACE_LABELS = ['BF-1', 'BF-2', 'BF-3'];

// Furnace stack is the tallest, most massive structure on site — its height
// sets the scale hierarchy every other zone reads against.
const STACK_HEIGHT = 8.2;
const STACK_TOP_Y = STACK_HEIGHT + 0.6; // includes throat
const STOVE_HEIGHT = 5.6;

const EMBER_COUNT = 60;

export default function BlastFurnace({ critical }: Props) {
  const glowRefs = useRef<THREE.Mesh[]>([]);
  const emberRefs = useRef<THREE.Points[]>([]);
  const runnerGlowRefs = useRef<THREE.Mesh[]>([]);
  const furnaceLightRefs = useRef<THREE.PointLight[]>([]);

  const emberGeos = useMemo(() =>
    FURNACE_Z.map((_, fi) => {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(EMBER_COUNT * 3);
      for (let i = 0; i < EMBER_COUNT; i++) {
        const seed = fi * 1000 + i;
        positions[i * 3] = seededRange(seed, -0.3, 0.3);
        positions[i * 3 + 1] = STACK_TOP_Y + seededRange(seed + 1, 0, 3);
        positions[i * 3 + 2] = seededRange(seed + 2, -0.3, 0.3);
      }
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      return geo;
    }), []);

  useFrame(() => {
    const t = Date.now() * 0.001;
    // 3-second sine cycle — hot-metal activity "breathing" at the tap hole.
    const breath = Math.sin(t * ((Math.PI * 2) / 3));
    const intensity = critical ? 1.1 + Math.sin(t * 4) * 0.4 : 0.6 + breath * 0.2;
    glowRefs.current.forEach(mesh => {
      if (!mesh) return;
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    });
    runnerGlowRefs.current.forEach(mesh => {
      if (!mesh) return;
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.35 + Math.sin(t * 3 + 1) * 0.25;
    });
    // Moving point light at each furnace base, same 3s cycle as the glow —
    // casts a breathing pool of orange-red light on the surrounding floor.
    const lightIntensity = (critical ? 1.6 : 1.4) + breath * (critical ? 0.9 : 0.6);
    furnaceLightRefs.current.forEach(light => {
      if (!light) return;
      light.intensity = lightIntensity;
    });

    emberGeos.forEach((geo, fi) => {
      const positions = geo.attributes.position.array as Float32Array;
      for (let i = 0; i < EMBER_COUNT; i++) {
        positions[i * 3 + 1] += 0.01 + Math.random() * 0.01;
        positions[i * 3] += (Math.random() - 0.5) * 0.004;
        positions[i * 3 + 2] += (Math.random() - 0.5) * 0.004;
        if (positions[i * 3 + 1] > STACK_TOP_Y + 3.2) {
          const seed = fi * 1000 + i + t * 100;
          positions[i * 3] = seededRange(seed, -0.3, 0.3);
          positions[i * 3 + 1] = STACK_TOP_Y;
          positions[i * 3 + 2] = seededRange(seed + 2, -0.3, 0.3);
        }
      }
      geo.attributes.position.needsUpdate = true;
      const points = emberRefs.current[fi];
      if (points) {
        (points.material as THREE.PointsMaterial).opacity = critical ? 0.85 : 0.5;
      }
    });
  });

  return (
    <group position={CENTER}>
      {/* Cast house floor — weathered concrete */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[4.6, 0.06, 8.6]} />
        <meshStandardMaterial color="#3a3d40" metalness={0.15} roughness={0.95} />
      </mesh>

      {FURNACE_Z.map((z, fi) => (
        <group key={`bf-${fi}`} position={[0, 0, z]}>
          {/* Furnace stack — tall cylinder, oxidized dark-red-brown shell */}
          <mesh position={[0, STACK_HEIGHT / 2, 0]} castShadow>
            <cylinderGeometry args={[0.85, 1.15, STACK_HEIGHT, 16]} />
            <meshStandardMaterial color="#5a2e1f" metalness={0.55} roughness={0.75} />
          </mesh>
          {/* Rust streak accents */}
          <mesh position={[0.3, STACK_HEIGHT * 0.35, 0.7]}>
            <cylinderGeometry args={[0.87, 0.95, STACK_HEIGHT * 0.4, 16, 1, true]} />
            <meshStandardMaterial color="#3d1f14" metalness={0.4} roughness={0.9} transparent opacity={0.55} />
          </mesh>
          {/* Shell reinforcement bands */}
          {[0.9, 2.3, 3.8, 5.3, 6.8].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <torusGeometry args={[1.02 - i * 0.035, 0.035, 6, 20]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.85} roughness={0.25} />
            </mesh>
          ))}
          {/* Downcomer piping around the stack */}
          {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((angle, i) => (
            <mesh
              key={`downcomer-${i}`}
              position={[Math.cos(angle) * 1.05, STACK_HEIGHT * 0.55, Math.sin(angle) * 1.05]}
              castShadow
            >
              <cylinderGeometry args={[0.09, 0.09, STACK_HEIGHT * 0.75, 8]} />
              <meshStandardMaterial color="#6b7280" metalness={0.75} roughness={0.4} />
            </mesh>
          ))}
          {/* Throat / top */}
          <mesh position={[0, STACK_TOP_Y - 0.3, 0]}>
            <cylinderGeometry args={[0.45, 0.85, 0.6, 12]} />
            <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.35} />
          </mesh>
          {/* Bleeder valve stacks on top */}
          {[[-0.5, -0.3], [0.5, 0.3]].map((p, i) => (
            <mesh key={i} position={[p[0], STACK_TOP_Y + 0.4, p[1]]}>
              <cylinderGeometry args={[0.08, 0.1, 1.0, 8]} />
              <meshStandardMaterial color="#3f3f46" metalness={0.7} roughness={0.5} />
            </mesh>
          ))}

          {/* Hot-metal glow at base (tap hole area) */}
          <mesh
            ref={el => { if (el) glowRefs.current[fi] = el; }}
            position={[0, 0.18, 0]}
          >
            <torusGeometry args={[1.0, 0.14, 8, 20]} />
            <meshStandardMaterial color="#1a0f08" emissive="#ff5500" emissiveIntensity={0.6} />
          </mesh>

          {/* Breathing point light at the furnace base — casts moving orange
              light and shadows on the floor and surrounding structures. */}
          <pointLight
            ref={el => { if (el) furnaceLightRefs.current[fi] = el; }}
            position={[0, 0.7, 0]}
            color="#FF4500"
            intensity={1.4}
            distance={9}
            decay={2}
            castShadow
          />

          {/* 4 hot blast stoves surrounding this furnace — tall domed cylinders */}
          {[
            [1.6, 0.85], [-1.6, 0.85], [1.6, -0.85], [-1.6, -0.85],
          ].map((p, si) => (
            <group key={si} position={[p[0], 0, p[1]]}>
              <mesh position={[0, STOVE_HEIGHT / 2, 0]} castShadow>
                <cylinderGeometry args={[0.42, 0.42, STOVE_HEIGHT, 12]} />
                <meshStandardMaterial color="#7a3a24" metalness={0.65} roughness={0.55} />
              </mesh>
              {[STOVE_HEIGHT * 0.3, STOVE_HEIGHT * 0.6, STOVE_HEIGHT * 0.85].map((y, bi) => (
                <mesh key={bi} position={[0, y, 0]}>
                  <torusGeometry args={[0.43, 0.02, 6, 16]} />
                  <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.3} />
                </mesh>
              ))}
              <mesh position={[0, STOVE_HEIGHT + 0.3, 0]}>
                <sphereGeometry args={[0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#7a3a24" metalness={0.65} roughness={0.55} />
              </mesh>
            </group>
          ))}

          {/* Hot metal runners connecting stoves to furnace — glowing channel */}
          {[[1.6, 0.85], [-1.6, -0.85]].map((p, ri) => (
            <mesh
              key={`runner-${ri}`}
              ref={el => { if (el) runnerGlowRefs.current[fi * 2 + ri] = el; }}
              position={[p[0] / 2, 0.42, p[1] / 2]}
              rotation={[0, Math.atan2(p[0], p[1]), Math.PI / 2]}
            >
              <cylinderGeometry args={[0.09, 0.09, Math.hypot(p[0], p[1]), 8]} />
              <meshStandardMaterial color="#7a1f0a" metalness={0.5} roughness={0.4} emissive="#ff4400" emissiveIntensity={0.3} />
            </mesh>
          ))}

          {/* Ember / spark emission from the furnace top */}
          <points ref={el => { if (el) emberRefs.current[fi] = el as unknown as THREE.Points; }} geometry={emberGeos[fi]}>
            <pointsMaterial size={0.055} color="#ff7722" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
          </points>

          <Billboard position={[0, STACK_TOP_Y + 3.6, 0]}>
            <Text fontSize={0.2} color={critical ? '#fca5a5' : '#cbd5e1'} anchorX="center" anchorY="bottom" outlineWidth={0.007} outlineColor="#000000">
              {FURNACE_LABELS[fi]}
            </Text>
          </Billboard>

          {/* Scaffolding / ductwork clutter at the base for visual density */}
          {Array.from({ length: 5 }).map((_, ci) => {
            const seed = fi * 50 + ci;
            const angle = seededRange(seed, 0, Math.PI * 2);
            const dist = seededRange(seed + 1, 1.3, 1.7);
            return (
              <mesh
                key={ci}
                position={[Math.cos(angle) * dist, seededRange(seed + 2, 0.4, 1.6), Math.sin(angle) * dist]}
                rotation={[0, angle, seededRange(seed + 3, -0.2, 0.2)]}
              >
                <boxGeometry args={[0.05, seededRange(seed + 4, 0.8, 1.8), 0.05]} />
                <meshStandardMaterial color="#4b5563" metalness={0.6} roughness={0.6} />
              </mesh>
            );
          })}
        </group>
      ))}

      <Billboard position={[0, STACK_TOP_Y + 4.4, 0]}>
        <Text fontSize={0.28} color={critical ? '#fca5a5' : '#94a3b8'} anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000000">
          BLAST FURNACE
        </Text>
      </Billboard>
    </group>
  );
}
