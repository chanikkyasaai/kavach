import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  criticalZones: string[];
}

export default function SteelPlantStructures({ criticalZones }: Props) {
  const furnaceGlowRef = useRef<THREE.Mesh>(null);
  const chimneySmoke1 = useRef<THREE.Mesh>(null);
  const chimneySmoke2 = useRef<THREE.Mesh>(null);
  const ladleRef = useRef<THREE.Group>(null);
  const craneRef = useRef<THREE.Group>(null);

  const z1Critical = criticalZones.includes('Z1');

  useFrame(() => {
    if (furnaceGlowRef.current) {
      const mat = furnaceGlowRef.current.material as THREE.MeshBasicMaterial;
      const intensity = z1Critical
        ? 0.5 + Math.sin(Date.now() * 0.005) * 0.3
        : 0.2 + Math.sin(Date.now() * 0.002) * 0.08;
      mat.opacity = intensity;
    }

    if (chimneySmoke1.current) {
      chimneySmoke1.current.position.y = 4 + Math.sin(Date.now() * 0.001) * 0.3;
      chimneySmoke1.current.rotation.y += 0.002;
      const s = 1 + Math.sin(Date.now() * 0.0015) * 0.2;
      chimneySmoke1.current.scale.set(s, 1, s);
    }
    if (chimneySmoke2.current) {
      chimneySmoke2.current.position.y = 3.5 + Math.cos(Date.now() * 0.0012) * 0.2;
      chimneySmoke2.current.rotation.y -= 0.001;
    }

    if (ladleRef.current) {
      ladleRef.current.rotation.y = Math.sin(Date.now() * 0.0005) * 0.05;
    }

    if (craneRef.current) {
      craneRef.current.position.x = 1 + Math.sin(Date.now() * 0.0003) * 0.5;
    }
  });

  return (
    <group>
      {/* === ZONE 1: STEEL MELT SHOP === */}
      <group position={[-2, 0, -2]}>
        {/* Steel columns — silver/grey */}
        {[[-1.8, 0, -1.3], [-1.8, 0, 1.3], [1.8, 0, -1.3], [1.8, 0, 1.3]].map((pos, i) => (
          <mesh key={`col1-${i}`} position={[pos[0], 1.5, pos[2]]} castShadow>
            <boxGeometry args={[0.1, 3, 0.1]} />
            <meshStandardMaterial color="#7d8ea3" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Roof truss — light steel */}
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[3.8, 0.08, 2.8]} />
          <meshStandardMaterial color="#5c6b7a" metalness={0.8} roughness={0.3} transparent opacity={0.7} />
        </mesh>

        {/* Cross beams */}
        <mesh position={[0, 2.8, 0]}>
          <boxGeometry args={[3.6, 0.04, 0.04]} />
          <meshStandardMaterial color="#8899aa" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.8, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[2.6, 0.04, 0.04]} />
          <meshStandardMaterial color="#8899aa" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* BOF Converter — rust orange steel vessel */}
        <mesh position={[-0.8, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.6, 1.5, 16]} />
          <meshStandardMaterial color="#b85c2a" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Converter trunnion ring */}
        <mesh position={[-0.8, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.04, 8, 24]} />
          <meshStandardMaterial color="#8899aa" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Converter mouth — open top with glow */}
        <mesh position={[-0.8, 1.7, 0]}>
          <cylinderGeometry args={[0.3, 0.45, 0.12, 16]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Furnace inner glow */}
        <mesh ref={furnaceGlowRef} position={[-0.8, 1.75, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color={z1Critical ? '#ff2200' : '#ff6600'} transparent opacity={0.2} />
        </mesh>

        {/* Ladle — steel bucket */}
        <group ref={ladleRef} position={[0.7, 0.4, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.32, 0.7, 12]} />
            <meshStandardMaterial color="#8b6914" metalness={0.75} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <torusGeometry args={[0.22, 0.025, 8, 16]} />
            <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Molten steel glow */}
          <mesh position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.19, 16]} />
            <meshBasicMaterial color="#ff5500" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Overhead crane — yellow */}
        <group ref={craneRef}>
          <mesh position={[0, 2.7, 0]}>
            <boxGeometry args={[0.7, 0.08, 2.5]} />
            <meshStandardMaterial color="#eab308" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 2.3, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.4, 4]} />
            <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Hook */}
          <mesh position={[0, 2.05, 0]}>
            <torusGeometry args={[0.04, 0.01, 6, 12]} />
            <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* === ZONE 2: BLAST FURNACE === */}
      <group position={[3, 0, -1]}>
        {/* BF body — tall conical shape, rusty iron look */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.65, 3.2, 12]} />
          <meshStandardMaterial color="#8b5e3c" metalness={0.6} roughness={0.5} />
        </mesh>
        {/* BF shell bands */}
        {[0.5, 1.2, 1.9, 2.6].map((y, i) => (
          <mesh key={`bfband-${i}`} position={[0, y, 0]}>
            <torusGeometry args={[0.55 - i * 0.05, 0.025, 6, 16]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
        {/* BF throat / top */}
        <mesh position={[0, 3.3, 0]}>
          <cylinderGeometry args={[0.2, 0.35, 0.25, 10]} />
          <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Hot blast stove */}
        <mesh position={[0.9, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 2.6, 10]} />
          <meshStandardMaterial color="#a0522d" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Stove dome */}
        <mesh position={[0.9, 2.65, 0]}>
          <sphereGeometry args={[0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#a0522d" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Chimney — concrete grey */}
        <mesh position={[0, 3.8, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 1.2, 8]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.6} />
        </mesh>
        {/* Smoke wisps */}
        <mesh ref={chimneySmoke1} position={[0, 4.3, 0]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshBasicMaterial color="#99aabb" transparent opacity={0.12} />
        </mesh>
        <mesh ref={chimneySmoke2} position={[0.08, 4.6, 0.05]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#8899aa" transparent opacity={0.08} />
        </mesh>

        {/* Gas holder — large cylindrical tank, industrial green/grey */}
        <mesh position={[0.4, 0.65, -0.8]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.3, 16]} />
          <meshStandardMaterial color="#4a6741" metalness={0.6} roughness={0.5} />
        </mesh>
        {/* Gas holder bands */}
        {[0.2, 0.65, 1.1].map((y, i) => (
          <mesh key={`ghband-${i}`} position={[0.4, y, -0.8]}>
            <torusGeometry args={[0.41, 0.018, 4, 16]} />
            <meshStandardMaterial color="#7d8ea3" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* === ZONE 3: COKE OVEN BATTERY === */}
      <group position={[-3, 0, 2]}>
        {/* Coke oven chambers — brick red */}
        {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
          <mesh key={`oven-${i}`} position={[x, 0.55, 0]} castShadow>
            <boxGeometry args={[0.28, 1.1, 1.4]} />
            <meshStandardMaterial color="#a0522d" metalness={0.3} roughness={0.7} />
          </mesh>
        ))}
        {/* Top platform — concrete */}
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[2.4, 0.06, 1.6]} />
          <meshStandardMaterial color="#8899aa" metalness={0.4} roughness={0.6} />
        </mesh>
        {/* Charging car rail */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[2.4, 0.02, 0.06]} />
          <meshStandardMaterial color="#bbb" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Quenching tower — concrete */}
        <mesh position={[1.2, 0.9, 0.5]} castShadow>
          <boxGeometry args={[0.4, 1.8, 0.4]} />
          <meshStandardMaterial color="#7d8ea3" metalness={0.4} roughness={0.6} />
        </mesh>
      </group>

      {/* === ZONE 4: CONTINUOUS CASTING === */}
      <group position={[1, 0, 2]}>
        {/* Tundish — refractory lined */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.8, 0.3, 0.35]} />
          <meshStandardMaterial color="#b85c2a" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Mold — copper/steel */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[0.18, 0.7, 0.18]} />
          <meshStandardMaterial color="#cd7f32" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Strand roller guide */}
        <mesh position={[0, 0.25, 0.3]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.14, 0.7, 0.14]} />
          <meshStandardMaterial color="#7d8ea3" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Spray cooling manifold */}
        {[-0.25, 0, 0.25].map((z, i) => (
          <mesh key={`spray-${i}`} position={[0.25, 0.75, z]}>
            <cylinderGeometry args={[0.018, 0.018, 0.35, 6]} />
            <meshStandardMaterial color="#06b6d4" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Support frame */}
        <mesh position={[0, 0.7, -0.3]}>
          <boxGeometry args={[1, 0.04, 0.04]} />
          <meshStandardMaterial color="#7d8ea3" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* === ZONE 5: ROLLING MILL === */}
      <group position={[3.5, 0, 1]}>
        {/* Mill housing — heavy steel, blue-grey */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[1.4, 1.3, 0.8]} />
          <meshStandardMaterial color="#5c6b7a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Roll pair — polished steel */}
        <mesh position={[0, 0.65, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.25, 16]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.95} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.65, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.25, 16]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Roller table */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[1.8, 0.06, 0.5]} />
          <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Table rollers */}
        {[-0.7, -0.35, 0, 0.35, 0.7].map((x, i) => (
          <mesh key={`roller-${i}`} position={[x, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* === ZONE 6: SINTER PLANT === */}
      <group position={[-4, 0, 0]}>
        {/* Sinter machine bed */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.4, 0.5, 0.9]} />
          <meshStandardMaterial color="#6b5b3a" metalness={0.5} roughness={0.6} />
        </mesh>
        {/* Ignition hood */}
        <mesh position={[-0.3, 0.8, 0]}>
          <boxGeometry args={[0.4, 0.3, 0.8]} />
          <meshStandardMaterial color="#8b5e3c" metalness={0.6} roughness={0.5} />
        </mesh>
        {/* Wind box / fan housing */}
        <mesh position={[0.4, 0.9, 0.3]}>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 10]} />
          <meshStandardMaterial color="#7d8ea3" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Cooler drum */}
        <mesh position={[0.6, 0.35, -0.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.5, 12]} />
          <meshStandardMaterial color="#5c6b7a" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* === GROUND INFRASTRUCTURE === */}
      {/* Concrete road/pathways between zones */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 8]} />
        <meshStandardMaterial color="#3d4a5c" metalness={0.2} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[0.5, 10]} />
        <meshStandardMaterial color="#3d4a5c" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Warning lights when critical */}
      {z1Critical && (
        <>
          <pointLight position={[-2, 3.5, -2]} color="#ff0000" intensity={4} distance={6} decay={2} />
          <pointLight position={[-3, 1.5, -1.5]} color="#ff2200" intensity={2} distance={4} decay={2} />
        </>
      )}
    </group>
  );
}
