import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard, Text } from '@react-three/drei';
import type { Sensor } from '../../data/sensors';
import type { SensorReading } from '../../store/useStore';

interface SensorNodeProps {
  sensor: Sensor;
  reading?: SensorReading;
}

export default function SensorNode({ sensor, reading }: SensorNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  const value = reading?.value ?? sensor.baseline;
  const pctThreshold = value / sensor.threshold;
  const isAlarm = pctThreshold >= 1;
  const isWarning = pctThreshold >= 0.8;

  const color = isAlarm ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

  useFrame(() => {
    const time = Date.now() * 0.001;
    const offset = sensor.id.charCodeAt(1) * 0.7;

    if (meshRef.current) {
      // Idle breathing — slow scale pulse
      const breathe = 1 + Math.sin(time * 1.2 + offset) * 0.08;
      meshRef.current.scale.setScalar(breathe);

      // Vertical bobbing
      const bob = Math.sin(time * 0.8 + offset) * 0.015;
      meshRef.current.position.y = sensor.position.y + bob;

      // Emissive intensity based on threat level
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (isAlarm) {
        mat.emissiveIntensity = 0.8 + Math.sin(time * 6) * 0.4;
      } else if (isWarning) {
        mat.emissiveIntensity = 0.4 + Math.sin(time * 3) * 0.2;
      } else {
        mat.emissiveIntensity = 0.15 + Math.sin(time * 1.2 + offset) * 0.08;
      }
    }

    if (ringRef.current) {
      // Slow idle rotation — always spinning
      ringRef.current.rotation.y += isAlarm ? 0.03 : 0.008;
      ringRef.current.rotation.x = Math.sin(time * 0.5 + offset) * 0.2;
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.y -= 0.005;
      outerRingRef.current.rotation.z = Math.cos(time * 0.4 + offset) * 0.15;
      const mat = outerRingRef.current.material as THREE.MeshBasicMaterial;
      // Breathing opacity
      mat.opacity = isAlarm ? 0.5 + Math.sin(time * 4) * 0.3 : 0.15 + Math.sin(time * 0.8 + offset) * 0.08;
    }

    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      // Gentle pulsing beam
      mat.opacity = isAlarm ? 0.35 : isWarning ? 0.15 : 0.04 + Math.sin(time * 0.6 + offset) * 0.02;
    }
  });

  return (
    <group position={[sensor.position.x, 0, sensor.position.z]}>
      {/* Vertical light beam from ground */}
      <mesh ref={beamRef} position={[0, sensor.position.y / 2, 0]}>
        <cylinderGeometry args={[0.004, 0.012, sensor.position.y, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.04} />
      </mesh>

      {/* Base ring on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[0.06, 0.08, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Sensor core — dodecahedron */}
      <mesh ref={meshRef} position={[0, sensor.position.y, 0]} castShadow>
        <dodecahedronGeometry args={[0.055, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Inner orbit ring */}
      <mesh ref={ringRef} position={[0, sensor.position.y, 0]}>
        <torusGeometry args={[0.1, 0.005, 6, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {/* Outer orbit ring */}
      <mesh ref={outerRingRef} position={[0, sensor.position.y, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.14, 0.003, 4, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>

      {/* Value label */}
      <Billboard position={[0, sensor.position.y + 0.18, 0]}>
        <Text
          fontSize={0.065}
          color={color}
          anchorX="center"
          anchorY="bottom"
          font={undefined}
        >
          {value.toFixed(0)}{sensor.unit}
        </Text>
      </Billboard>

      {/* Alarm point light */}
      {isAlarm && (
        <pointLight
          position={[0, sensor.position.y, 0]}
          color={color}
          intensity={0.6}
          distance={1.2}
          decay={2}
        />
      )}
    </group>
  );
}
