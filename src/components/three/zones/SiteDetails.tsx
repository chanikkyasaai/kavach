import { seededRandom, seededRange } from '../proceduralUtils';

interface Band {
  xMin: number; xMax: number; zMin: number; zMax: number; count: number; seedBase: number;
}

// Scattered yard detail across the otherwise-empty ground between named
// zones — small tanks, light poles, and container blocks. Deterministic
// (seeded) placement so nothing pops between renders.
const BANDS: Band[] = [
  { xMin: -15.5, xMax: -12.5, zMin: -3, zMax: 4, count: 7, seedBase: 100 },
  { xMin: -9, xMax: -7, zMin: -3, zMax: 5, count: 6, seedBase: 200 },
  { xMin: -4, xMax: -1.5, zMin: -3.5, zMax: 4.5, count: 7, seedBase: 300 },
  { xMin: 2.5, xMax: 4.8, zMin: -3, zMax: 4, count: 6, seedBase: 400 },
  { xMin: 13, xMax: 15, zMin: -3, zMax: 4, count: 6, seedBase: 500 },
  { xMin: -4, xMax: 3, zMin: 4.5, zMax: 6.5, count: 8, seedBase: 600 },
];

type PropKind = 'tank' | 'pole' | 'container';

function propKindFor(seed: number): PropKind {
  const r = seededRandom(seed);
  if (r < 0.35) return 'tank';
  if (r < 0.7) return 'pole';
  return 'container';
}

function SiteProp({ kind, seed }: { kind: PropKind; seed: number }) {
  if (kind === 'tank') {
    const h = seededRange(seed + 1, 0.5, 1.1);
    const r = seededRange(seed + 2, 0.16, 0.28);
    return (
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[r, r, h, 10]} />
        <meshStandardMaterial color="#4b5563" metalness={0.6} roughness={0.55} />
      </mesh>
    );
  }
  if (kind === 'pole') {
    const h = seededRange(seed + 1, 1.4, 2.2);
    return (
      <group>
        <mesh position={[0, h / 2, 0]}>
          <cylinderGeometry args={[0.025, 0.03, h, 6]} />
          <meshStandardMaterial color="#2b3038" metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[0, h, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.8} />
        </mesh>
        <pointLight position={[0, h, 0]} color="#fde68a" intensity={0.35} distance={2.2} decay={2} />
      </group>
    );
  }
  const w = seededRange(seed + 1, 0.3, 0.5);
  const l = seededRange(seed + 2, 0.4, 0.7);
  const rot = seededRange(seed + 3, 0, Math.PI);
  return (
    <mesh position={[0, 0.18, 0]} rotation={[0, rot, 0]} castShadow>
      <boxGeometry args={[w, 0.36, l]} />
      <meshStandardMaterial color="#5a5142" metalness={0.4} roughness={0.7} />
    </mesh>
  );
}

export default function SiteDetails() {
  return (
    <group>
      {BANDS.map((band, bi) => (
        <group key={bi}>
          {Array.from({ length: band.count }).map((_, i) => {
            const seed = band.seedBase + i * 7;
            const x = seededRange(seed, band.xMin, band.xMax);
            const z = seededRange(seed + 4, band.zMin, band.zMax);
            const kind = propKindFor(seed + 5);
            return (
              <group key={i} position={[x, 0, z]}>
                <SiteProp kind={kind} seed={seed} />
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}
