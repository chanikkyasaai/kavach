import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MAIN_LINE: [number, number][] = [
  [-17, 1],
  [-11, -1],
  [-6, 3],
  [0, -1],
  [6.5, 0],
  [11, 3],
  [16, 0],
];

const SPURS: [number, number][][] = [
  [[0, -1], [-2, 8]],
];

const GAUGE = 0.09;
const TIE_SPACING = 0.35;

function RailSegment({ from, to }: { from: [number, number]; to: [number, number] }) {
  const { angle, length, midX, midZ } = useMemo(() => {
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    return {
      angle: Math.atan2(dx, dz),
      length: Math.hypot(dx, dz),
      midX: (from[0] + to[0]) / 2,
      midZ: (from[1] + to[1]) / 2,
    };
  }, [from, to]);

  const tieCount = Math.max(2, Math.floor(length / TIE_SPACING));

  return (
    <group position={[midX, 0, midZ]} rotation={[0, angle, 0]}>
      {[-GAUGE, GAUGE].map((x, i) => (
        <mesh key={i} position={[x, 0.035, 0]}>
          <boxGeometry args={[0.025, 0.05, length]} />
          <meshStandardMaterial color="#8a8f97" metalness={0.75} roughness={0.35} />
        </mesh>
      ))}
      {Array.from({ length: tieCount }).map((_, i) => {
        const zLocal = (i / (tieCount - 1) - 0.5) * length;
        return (
          <mesh key={i} position={[0, 0.015, zLocal]}>
            <boxGeometry args={[GAUGE * 2.6, 0.03, 0.09]} />
            <meshStandardMaterial color="#2a231c" metalness={0.1} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

function RailCar({ color = '#5a4a1f' }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[0.32, 0.16, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.6} />
      </mesh>
      {[-0.2, 0.2].map((z, i) => (
        [-0.13, 0.13].map((x, xi) => (
          <mesh key={`${i}-${xi}`} position={[x, 0.06, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.04, 10]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.5} />
          </mesh>
        ))
      ))}
    </group>
  );
}

/** Internal railway network with real twin-rail geometry, sleeper ties, and
 *  rail cars — connecting RMHP, the Blast Furnace spine, and support infra. */
export default function RailNetwork() {
  const movingCarRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!movingCarRef.current) return;
    const t = (Math.sin(Date.now() * 0.00012) + 1) / 2; // 0..1, slow drift
    const from = MAIN_LINE[4]; // SMS
    const to = MAIN_LINE[6]; // Rolling Mills
    movingCarRef.current.position.set(
      from[0] + (to[0] - from[0]) * t,
      0,
      from[1] + (to[1] - from[1]) * t
    );
  });

  return (
    <group>
      {MAIN_LINE.slice(0, -1).map((p, i) => (
        <RailSegment key={i} from={p} to={MAIN_LINE[i + 1]} />
      ))}
      {SPURS.map((spur, i) => (
        <RailSegment key={`spur-${i}`} from={spur[0]} to={spur[1]} />
      ))}

      {/* Static rail cars near RMHP */}
      <group position={[-15, 0, 0.4]}>
        <RailCar color="#3f3f2c" />
      </group>
      <group position={[-14.4, 0, 0.4]}>
        <RailCar color="#4a3a1f" />
      </group>

      {/* Slow-moving rail car between SMS and Rolling Mills */}
      <group ref={movingCarRef}>
        <RailCar color="#5a4a1f" />
      </group>
    </group>
  );
}
