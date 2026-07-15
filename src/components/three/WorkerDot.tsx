import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard, Text } from '@react-three/drei';
import type { Worker } from '../../data/workers';

interface WorkerDotProps {
  worker: Worker;
  isCriticalZone: boolean;
}

export default function WorkerDot({ worker, isCriticalZone }: WorkerDotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const isPermanent = worker.type === 'permanent';
  const baseColor = isPermanent ? '#3b82f6' : '#f59e0b';
  const alertColor = '#ef4444';
  const currentColor = isCriticalZone ? alertColor : baseColor;

  useFrame(() => {
    const time = Date.now() * 0.001;
    const offset = worker.id.charCodeAt(2) * 0.7;

    if (!groupRef.current) return;

    // Slow wandering movement
    const moveRadius = 0.04;
    groupRef.current.position.x = worker.position.x + Math.sin(time * 0.2 + offset) * moveRadius;
    groupRef.current.position.z = worker.position.z + Math.cos(time * 0.25 + offset) * moveRadius;

    if (meshRef.current) {
      // Gentle bobbing
      meshRef.current.position.y = 0.16 + Math.sin(time * 1.0 + offset) * 0.01;

      // Critical zone pulsing
      if (isCriticalZone) {
        const scale = 1 + Math.sin(time * 3 + offset) * 0.2;
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }

    // Ambient glow — always present, breathes slowly
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      if (isCriticalZone) {
        mat.opacity = 0.3 + Math.sin(time * 4 + offset) * 0.15;
        mat.color.set(alertColor);
      } else {
        mat.opacity = 0.08 + Math.sin(time * 0.8 + offset) * 0.04;
        mat.color.set(baseColor);
      }
    }

    // Alert expanding ring
    if (ringRef.current) {
      ringRef.current.visible = isCriticalZone;
      if (isCriticalZone) {
        const t = ((Date.now() + offset * 500) % 1500) / 1500;
        const s = 1 + t * 2;
        ringRef.current.scale.set(s, s, s);
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - t);
      }
    }
  });

  return (
    <group ref={groupRef} position={[worker.position.x, 0, worker.position.z]}>
      {/* Ambient ground glow */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[0.1, 12]} />
        <meshBasicMaterial color={baseColor} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* Worker body */}
      <mesh ref={meshRef} position={[0, 0.16, 0]} castShadow>
        {isPermanent ? (
          <octahedronGeometry args={[0.065, 0]} />
        ) : (
          <sphereGeometry args={[0.055, 12, 12]} />
        )}
        <meshStandardMaterial
          color={currentColor}
          emissive={currentColor}
          emissiveIntensity={isCriticalZone ? 0.6 : 0.15}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>

      {/* Alert ring */}
      <mesh ref={ringRef} position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.06, 0.075, 12]} />
        <meshBasicMaterial color={alertColor} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Training expired marker */}
      {!worker.trained && (
        <mesh position={[0.07, 0.28, 0]}>
          <boxGeometry args={[0.02, 0.02, 0.02]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      )}

      {/* Name label in critical zone */}
      {isCriticalZone && (
        <Billboard position={[0, 0.32, 0]}>
          <Text
            fontSize={0.055}
            color={currentColor}
            anchorX="center"
            anchorY="bottom"
            font={undefined}
            outlineWidth={0.003}
            outlineColor="#000000"
          >
            {worker.name.split(' ')[0]}
          </Text>
          <Text
            fontSize={0.035}
            color={isPermanent ? '#93c5fd' : '#fcd34d'}
            anchorX="center"
            anchorY="top"
            position={[0, -0.005, 0]}
            font={undefined}
          >
            {worker.type === 'contract' ? 'CONTRACT' : 'PERM'}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
