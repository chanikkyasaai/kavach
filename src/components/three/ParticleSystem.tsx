import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  criticalZones: string[];
  compoundRisk: number;
}

export default function ParticleSystem({ criticalZones, compoundRisk }: Props) {
  const sparksRef = useRef<THREE.Points>(null);
  const smokeRef = useRef<THREE.Points>(null);
  const heatRef = useRef<THREE.Points>(null);

  const sparkCount = 200;
  const smokeCount = 80;
  const heatCount = 120;

  // Create geometries imperatively
  const sparkGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      positions[i * 3] = 6.5 + (Math.random() - 0.5) * 3;
      positions[i * 3 + 1] = Math.random() * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const smokeGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      positions[i * 3] = 0 + (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = 9 + Math.random() * 2;
      positions[i * 3 + 2] = -1 + (Math.random() - 0.5) * 0.5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const heatGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(heatCount * 3);
    for (let i = 0; i < heatCount; i++) {
      positions[i * 3] = 6.5 + (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const sparkSpeeds = useMemo(() =>
    Array.from({ length: sparkCount }, () => ({
      vx: (Math.random() - 0.5) * 0.02,
      vy: 0.01 + Math.random() * 0.03,
      vz: (Math.random() - 0.5) * 0.02,
      life: Math.random(),
    })), []);

  useFrame(() => {
    // Animate sparks
    if (sparksRef.current) {
      const positions = sparkGeo.attributes.position.array as Float32Array;
      const isActive = compoundRisk > 40;

      for (let i = 0; i < sparkCount; i++) {
        positions[i * 3] += sparkSpeeds[i].vx;
        positions[i * 3 + 1] += sparkSpeeds[i].vy;
        positions[i * 3 + 2] += sparkSpeeds[i].vz;

        sparkSpeeds[i].life -= 0.008;
        if (sparkSpeeds[i].life <= 0 || positions[i * 3 + 1] > 5) {
          positions[i * 3] = 6.5 + (Math.random() - 0.5) * 3;
          positions[i * 3 + 1] = 0.3 + Math.random() * 0.5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
          sparkSpeeds[i].life = 0.5 + Math.random() * 0.5;
          sparkSpeeds[i].vy = 0.01 + Math.random() * (isActive ? 0.05 : 0.02);
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;

      const mat = sparksRef.current.material as THREE.PointsMaterial;
      mat.opacity = Math.min(0.8, compoundRisk / 120);
    }

    // Animate smoke
    if (smokeRef.current) {
      const positions = smokeGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < smokeCount; i++) {
        positions[i * 3 + 1] += 0.004 + Math.random() * 0.002;
        positions[i * 3] += (Math.random() - 0.5) * 0.004;

        if (positions[i * 3 + 1] > 12) {
          positions[i * 3] = (Math.random() - 0.5) * 0.5;
          positions[i * 3 + 1] = 9;
          positions[i * 3 + 2] = -1 + (Math.random() - 0.5) * 0.5;
        }
      }
      smokeGeo.attributes.position.needsUpdate = true;
    }

    // Heat shimmer
    if (heatRef.current) {
      const visible = criticalZones.includes('Z1');
      heatRef.current.visible = visible;
      if (visible) {
        const positions = heatGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < heatCount; i++) {
          positions[i * 3 + 1] += 0.015 + Math.random() * 0.008;
          positions[i * 3] += (Math.random() - 0.5) * 0.008;
          positions[i * 3 + 2] += (Math.random() - 0.5) * 0.008;

          if (positions[i * 3 + 1] > 4) {
            positions[i * 3] = 6.5 + (Math.random() - 0.5) * 4;
            positions[i * 3 + 1] = 0.1;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
          }
        }
        heatGeo.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Sparks / embers */}
      <points ref={sparksRef} geometry={sparkGeo}>
        <pointsMaterial
          size={0.04}
          color="#ff6600"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Smoke */}
      <points ref={smokeRef} geometry={smokeGeo}>
        <pointsMaterial
          size={0.12}
          color="#667788"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </points>

      {/* Heat distortion */}
      <points ref={heatRef} geometry={heatGeo} visible={false}>
        <pointsMaterial
          size={0.06}
          color="#ff3300"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
