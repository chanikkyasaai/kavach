import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard, Text } from '@react-three/drei';

interface SimopsBeamProps {
  active: boolean;
}

/**
 * A massive, unmissable red hazard indicator between Zone Z1 (Melt Shop) 
 * where PTW-437 + PTW-438 are in conflict.
 * Visible from across the room.
 */
export default function SimopsBeam({ active }: SimopsBeamProps) {
  const pillar1Ref = useRef<THREE.Mesh>(null);
  const pillar2Ref = useRef<THREE.Mesh>(null);
  const connectorRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  const warningRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!active) return;
    const time = Date.now() * 0.001;

    // Pulsing pillars
    if (pillar1Ref.current) {
      const mat = pillar1Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(time * 4) * 0.2;
    }
    if (pillar2Ref.current) {
      const mat = pillar2Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(time * 4 + 1) * 0.2;
    }

    // Connector beam pulsing
    if (connectorRef.current) {
      const mat = connectorRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + Math.sin(time * 6) * 0.2;
      connectorRef.current.position.y = 2 + Math.sin(time * 0.5) * 0.1;
    }

    // Expanding rings
    if (ring1Ref.current) {
      const t = (Date.now() % 1200) / 1200;
      const s = 0.5 + t * 2;
      ring1Ref.current.scale.set(s, s, s);
      (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - t);
    }
    if (ring2Ref.current) {
      const t = ((Date.now() + 600) % 1200) / 1200;
      const s = 0.5 + t * 2;
      ring2Ref.current.scale.set(s, s, s);
      (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - t);
    }

    // Flash — strobe effect
    if (flashRef.current) {
      const strobe = Math.sin(time * 8) > 0.7;
      (flashRef.current.material as THREE.MeshBasicMaterial).opacity = strobe ? 0.15 : 0;
    }

    // Warning text rotation
    if (warningRef.current) {
      warningRef.current.rotation.y = time * 0.5;
    }
  });

  if (!active) return null;

  // Position: SMS-1 ladle bay — the specific incident location within Z1
  const center: [number, number, number] = [6.5, 0, -1.7];

  return (
    <group position={center}>
      {/* Vertical danger pillars */}
      <mesh ref={pillar1Ref} position={[-1, 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 4, 8]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.4} />
      </mesh>
      <mesh ref={pillar2Ref} position={[1, 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 4, 8]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.4} />
      </mesh>

      {/* Horizontal connector beam */}
      <mesh ref={connectorRef} position={[0, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.2, 8]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.3} />
      </mesh>

      {/* Large hazard diamond in center */}
      <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.8}
          transparent
          opacity={0.8}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Expanding warning rings at base */}
      <mesh ref={ring1Ref} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 0.9, 24]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 0.9, 24]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Ground flash / strobe area */}
      <mesh ref={flashRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 24]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* SIMOPS label */}
      <group ref={warningRef} position={[0, 3.2, 0]}>
        <Billboard>
          <Text
            fontSize={0.18}
            color="#ff3333"
            anchorX="center"
            anchorY="middle"
            font={undefined}
            outlineWidth={0.008}
            outlineColor="#000000"
          >
            ⚠ SIMOPS CONFLICT
          </Text>
          <Text
            fontSize={0.09}
            color="#fca5a5"
            anchorX="center"
            anchorY="top"
            position={[0, -0.12, 0]}
            font={undefined}
          >
            PTW-437 × PTW-438 | OISD-105
          </Text>
        </Billboard>
      </group>

      {/* Large point light — red warning glow */}
      <pointLight position={[0, 2, 0]} color="#ff0000" intensity={5} distance={8} decay={2} />
      <pointLight position={[0, 0.5, 0]} color="#ff2200" intensity={3} distance={5} decay={2} />
    </group>
  );
}
