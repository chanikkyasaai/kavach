import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';
import { seededRange } from '../proceduralUtils';

interface Props {
  critical: boolean;
}

const CENTER: [number, number, number] = [-11, 0, -1];
const BURST_COUNT = 30;

/**
 * Zone 3 — Coke Oven & Coal Chemical Plant. Reads as long, low, dense block
 * rows (not cubes) — one of the most hazardous zones on site (CO-rich coke
 * oven gas, benzene, ammonia). Precursor gas readings in the scenario model
 * originate here.
 */
export default function CokeOvens({ critical }: Props) {
  const gasGlowRef = useRef<THREE.Mesh[]>([]);
  const burstRef = useRef<THREE.Points>(null);

  const batteryCount = 5;
  const batteryWidth = 6.6;
  const batterySpacing = batteryWidth / batteryCount;
  const doorsPerBattery = 6;

  const burstGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(BURST_COUNT * 3);
    for (let i = 0; i < BURST_COUNT; i++) {
      positions[i * 3] = seededRange(i, -batteryWidth / 2, batteryWidth / 2);
      positions[i * 3 + 1] = 1.15;
      positions[i * 3 + 2] = seededRange(i + 500, -1.2, 1.2);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [batteryWidth]);

  useFrame(() => {
    const t = Date.now() * 0.001;
    const intensity = critical ? 0.5 + Math.sin(t * 3) * 0.3 : 0.15 + Math.sin(t * 0.8) * 0.06;
    gasGlowRef.current.forEach(mesh => {
      if (!mesh) return;
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    });

    // Intermittent steam/smoke bursts — real coke-pushing operations vent visibly.
    if (burstRef.current) {
      const cycle = (t % 5) / 5; // 5-second burst cycle
      const active = cycle < 0.4;
      const positions = burstGeo.attributes.position.array as Float32Array;
      if (active) {
        for (let i = 0; i < BURST_COUNT; i++) {
          positions[i * 3 + 1] += 0.03 + Math.random() * 0.02;
        }
        burstGeo.attributes.position.needsUpdate = true;
      } else if (cycle < 0.42) {
        for (let i = 0; i < BURST_COUNT; i++) {
          positions[i * 3] = seededRange(i + t, -batteryWidth / 2, batteryWidth / 2);
          positions[i * 3 + 1] = 1.15;
          positions[i * 3 + 2] = seededRange(i + 500 + t, -1.2, 1.2);
        }
        burstGeo.attributes.position.needsUpdate = true;
      }
      (burstRef.current.material as THREE.PointsMaterial).opacity = active ? 0.35 : 0;
    }
  });

  return (
    <group position={CENTER}>
      {/* 5 coke oven battery structures — long, low, densely packed */}
      {Array.from({ length: batteryCount }).map((_, i) => {
        const x = -batteryWidth / 2 + batterySpacing / 2 + i * batterySpacing;
        return (
          <group key={`battery-${i}`} position={[x, 0, 0]}>
            <mesh position={[0, 0.55, 0]} castShadow>
              <boxGeometry args={[batterySpacing * 0.96, 1.05, 2.6]} />
              <meshStandardMaterial color="#332822" metalness={0.35} roughness={0.8} />
            </mesh>
            {/* Individual oven door ribs — reads as a dense repeating structure, not a cube */}
            {Array.from({ length: doorsPerBattery }).map((_, di) => {
              const dz = -1.2 + (2.4 / (doorsPerBattery - 1)) * di;
              return (
                <mesh key={di} position={[batterySpacing * 0.44, 0.5, dz]}>
                  <boxGeometry args={[0.03, 0.85, 0.12]} />
                  <meshStandardMaterial color="#1c1512" metalness={0.5} roughness={0.6} />
                </mesh>
              );
            })}
            {/* Standpipes along the battery top */}
            {[-1, -0.4, 0.2, 0.8].map((z, si) => (
              <mesh key={`sp-${si}`} position={[0, 1.2, z]} castShadow>
                <cylinderGeometry args={[0.05, 0.06, 0.35, 6]} />
                <meshStandardMaterial color="#54463a" metalness={0.5} roughness={0.6} />
              </mesh>
            ))}
            {/* Coke oven gas emissive glow along the top edge */}
            <mesh
              ref={el => { if (el) gasGlowRef.current[i] = el; }}
              position={[0, 1.09, 0]}
            >
              <boxGeometry args={[batterySpacing * 0.94, 0.03, 2.55]} />
              <meshStandardMaterial
                color="#0a1a10"
                emissive={critical ? '#b45309' : '#22c55e'}
                emissiveIntensity={0.15}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        );
      })}

      {/* Charging car rail on top platform */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[batteryWidth, 0.02, 0.08]} />
        <meshStandardMaterial color="#bbb" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Intermittent coke-pushing steam bursts */}
      <points ref={burstRef} geometry={burstGeo}>
        <pointsMaterial size={0.22} color="#c7d2d8" transparent opacity={0} depthWrite={false} />
      </points>

      {/* Coal chemical recovery towers */}
      {[-3.6, -3.9].map((z, i) => (
        <mesh key={`tower-${i}`} position={[3.3 + i * 0.4, 1.4, z + 3.4]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 2.6, 10]} />
          <meshStandardMaterial color="#5a5f66" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}

      {/* Coke Dry Cooling Plants — 5 clusters × 4 cylinders each */}
      {Array.from({ length: 5 }).map((_, c) => (
        <group key={`cdcp-${c}`} position={[-2.8 + c * 1.4, 0, -2.1]}>
          {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map((p, i) => (
            <mesh key={i} position={[p[0], 0.9, p[1]]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 1.8, 8]} />
              <meshStandardMaterial color="#41474f" metalness={0.6} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Quenching tower */}
      <mesh position={[4.2, 1.1, 2.2]} castShadow>
        <boxGeometry args={[0.6, 2.2, 0.6]} />
        <meshStandardMaterial color="#5a5f66" metalness={0.35} roughness={0.75} />
      </mesh>

      <Billboard position={[0, 1.9, -1.6]}>
        <Text fontSize={0.22} color={critical ? '#fca5a5' : '#94a3b8'} anchorX="center" anchorY="bottom" outlineWidth={0.008} outlineColor="#000000">
          COKE OVENS
        </Text>
      </Billboard>

      {critical && (
        <pointLight position={[0, 1.5, 0]} color="#f59e0b" intensity={3} distance={7} decay={2} />
      )}
    </group>
  );
}
