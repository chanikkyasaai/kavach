import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';
import type { Zone } from '../../data/zones';

interface ZonePlateProps {
  zone: Zone;
  isCritical: boolean;
}

export default function ZonePlate({ zone, isCritical }: ZonePlateProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const scanRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (isCritical) {
        // Escalate from dark neutral to angry red
        const pulse = 0.2 + Math.sin(Date.now() * 0.004) * 0.15;
        mat.emissiveIntensity = pulse;
        mat.opacity = 0.55 + Math.sin(Date.now() * 0.003) * 0.1;
        mat.color.set('#7f1d1d');
        mat.emissive.set('#ef4444');
      } else {
        // Dark, muted baseline — holographic zone outline, floor barely there
        mat.emissiveIntensity = 0.03;
        mat.opacity = 0.12;
        mat.color.set('#0a1420');
        mat.emissive.set('#00b4ff');
      }
    }

    if (pulseRef.current) {
      pulseRef.current.visible = isCritical;
      if (isCritical) {
        const t = (Date.now() % 2000) / 2000;
        const scale = 1 + t * 0.3;
        pulseRef.current.scale.set(scale, 1, scale);
        (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - t);
      }
    }

    if (scanRef.current) {
      scanRef.current.visible = isCritical;
      if (isCritical) {
        const t = (Date.now() % 1500) / 1500;
        scanRef.current.position.z = zone.position.z - zone.size.depth / 2 + t * zone.size.depth;
        (scanRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - Math.abs(t - 0.5) * 2);
      }
    }
  });

  return (
    <group position={[zone.position.x, zone.position.y, zone.position.z]}>
      {/* Main zone plate */}
      <mesh ref={meshRef} receiveShadow position={[0, 0.01, 0]}>
        <boxGeometry args={[zone.size.width, 0.04, zone.size.depth]} />
        <meshStandardMaterial
          color="#0a1420"
          emissive="#00b4ff"
          emissiveIntensity={0.03}
          transparent
          opacity={0.12}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Border — full-opacity glowing edge outline, holographic wireframe feel */}
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[zone.size.width + 0.01, 0.003, zone.size.depth + 0.01]} />
        <meshBasicMaterial
          color={isCritical ? '#ef4444' : '#00b4ff'}
          transparent
          opacity={isCritical ? 0.9 : 0.4}
        />
      </mesh>

      {/* Subtle cross markers */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[zone.size.width * 0.6, 0.002, 0.003]} />
        <meshBasicMaterial color="#00b4ff" transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.003, 0.002, zone.size.depth * 0.6]} />
        <meshBasicMaterial color="#00b4ff" transparent opacity={0.12} />
      </mesh>

      {/* Pulse ring for critical zones */}
      <mesh ref={pulseRef} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[
          Math.min(zone.size.width, zone.size.depth) / 2 - 0.1,
          Math.min(zone.size.width, zone.size.depth) / 2,
          24
        ]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Scanning line for critical */}
      <mesh ref={scanRef} position={[0, 0.04, 0]} visible={false}>
        <boxGeometry args={[zone.size.width * 0.9, 0.008, 0.015]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.4} />
      </mesh>

      {/* Zone ID label */}
      <Billboard position={[-zone.size.width / 2 + 0.12, 0.1, -zone.size.depth / 2 + 0.1]}>
        <Text
          fontSize={0.1}
          color={isCritical ? '#fca5a5' : '#00b4ff'}
          anchorX="left"
          anchorY="bottom"
          letterSpacing={0.08}
        >
          {zone.id}
        </Text>
      </Billboard>

      {/* Corner markers */}
      {[
        [-zone.size.width / 2, 0.03, -zone.size.depth / 2],
        [zone.size.width / 2, 0.03, -zone.size.depth / 2],
        [-zone.size.width / 2, 0.03, zone.size.depth / 2],
        [zone.size.width / 2, 0.03, zone.size.depth / 2],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshBasicMaterial
            color={isCritical ? '#ef4444' : '#00b4ff'}
            transparent
            opacity={isCritical ? 0.8 : 0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
