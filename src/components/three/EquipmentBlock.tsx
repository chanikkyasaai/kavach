import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Equipment } from '../../data/equipment';

interface EquipmentBlockProps {
  equipment: Equipment;
}

export default function EquipmentBlock({ equipment }: EquipmentBlockProps) {
  const groupRef = useRef<THREE.Group>(null);
  const indicatorRef = useRef<THREE.Mesh>(null);

  const agePct = equipment.age / equipment.designLife;
  const hasIssues = equipment.criticalWorkOrders > 0;
  const color = agePct > 0.8 ? '#e07020' : agePct > 0.6 ? '#d4a030' : '#7c8cf5';

  useFrame(() => {
    // Subtle vibration for equipment with issues
    if (groupRef.current && hasIssues) {
      const vibration = Math.sin(Date.now() * 0.02) * 0.003;
      groupRef.current.position.y = vibration;
    }

    // Blinking indicator for critical work orders
    if (indicatorRef.current && hasIssues) {
      const mat = indicatorRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[equipment.position.x, 0, equipment.position.z]}>
      {/* Equipment base pad */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.5]} />
        <meshStandardMaterial color="#1a2236" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Main equipment housing */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial
          color={color}
          emissive={hasIssues ? '#f97316' : color}
          emissiveIntensity={hasIssues ? 0.1 : 0.02}
          metalness={0.8}
          roughness={0.25}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Equipment wireframe highlight */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.37, 0.37, 0.37]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.15} />
      </mesh>

      {/* Status indicator light */}
      <mesh ref={indicatorRef} position={[0.15, 0.42, 0.15]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial
          color={hasIssues ? '#ef4444' : '#10b981'}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Equipment ID plate */}
      <mesh position={[0, 0.1, 0.18]}>
        <boxGeometry args={[0.15, 0.04, 0.005]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Critical work order count badge */}
      {hasIssues && (
        <mesh position={[0.2, 0.42, -0.1]}>
          <cylinderGeometry args={[0.03, 0.03, 0.01, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      )}
    </group>
  );
}
