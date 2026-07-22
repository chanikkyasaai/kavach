import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position: [number, number, number];
  scale?: number;
}

const PLUME_COUNT = 26;

/** Hyperboloid cooling tower with a continuous soft steam plume from the top. */
export default function CoolingTower({ position, scale = 1 }: Props) {
  const plumeRef = useRef<THREE.Points>(null);

  const towerGeo = useMemo(() => {
    const points = [
      new THREE.Vector2(0.55, 0),
      new THREE.Vector2(0.5, 0.3),
      new THREE.Vector2(0.32, 0.75),
      new THREE.Vector2(0.28, 1.0),
      new THREE.Vector2(0.34, 1.3),
      new THREE.Vector2(0.46, 1.5),
    ];
    return new THREE.LatheGeometry(points, 24);
  }, []);

  const plumeGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PLUME_COUNT * 3);
    for (let i = 0; i < PLUME_COUNT; i++) {
      const a = (i / PLUME_COUNT) * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * 0.2;
      positions[i * 3 + 1] = 1.5 + (i / PLUME_COUNT) * 0.5;
      positions[i * 3 + 2] = Math.sin(a) * 0.2;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!plumeRef.current) return;
    const positions = plumeGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < PLUME_COUNT; i++) {
      positions[i * 3 + 1] += 0.006;
      positions[i * 3] += (Math.random() - 0.5) * 0.003;
      positions[i * 3 + 2] += (Math.random() - 0.5) * 0.003;
      if (positions[i * 3 + 1] > 3.2) {
        const a = Math.random() * Math.PI * 2;
        positions[i * 3] = Math.cos(a) * 0.2;
        positions[i * 3 + 1] = 1.5;
        positions[i * 3 + 2] = Math.sin(a) * 0.2;
      }
    }
    plumeGeo.attributes.position.needsUpdate = true;
  });

  return (
    <group position={position} scale={scale}>
      <mesh geometry={towerGeo} castShadow>
        <meshStandardMaterial color="#8899aa" metalness={0.3} roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      <points ref={plumeRef} geometry={plumeGeo}>
        <pointsMaterial size={0.28} color="#dfe7ec" transparent opacity={0.25} depthWrite={false} />
      </points>
    </group>
  );
}
