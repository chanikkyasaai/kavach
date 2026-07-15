export interface Zone {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  size: { width: number; depth: number; height: number };
  color: string;
  minOperators: number;
}

export const zones: Zone[] = [
  { id: 'Z1', name: 'Steel Melt Shop', type: 'Melting', position: { x: -2, y: 0, z: -2 }, size: { width: 4, depth: 3, height: 0.1 }, color: '#3b4f6b', minOperators: 3 },
  { id: 'Z2', name: 'Blast Furnace Area', type: 'Smelting', position: { x: 3, y: 0, z: -1 }, size: { width: 3, depth: 3, height: 0.1 }, color: '#3b4f6b', minOperators: 2 },
  { id: 'Z3', name: 'Coke Oven Battery', type: 'Processing', position: { x: -3, y: 0, z: 2 }, size: { width: 3, depth: 2, height: 0.1 }, color: '#3b4f6b', minOperators: 2 },
  { id: 'Z4', name: 'Continuous Casting', type: 'Casting', position: { x: 1, y: 0, z: 2 }, size: { width: 3, depth: 2, height: 0.1 }, color: '#3b4f6b', minOperators: 2 },
  { id: 'Z5', name: 'Rolling Mill', type: 'Rolling', position: { x: 3.5, y: 0, z: 1 }, size: { width: 2, depth: 2, height: 0.1 }, color: '#3b4f6b', minOperators: 1 },
  { id: 'Z6', name: 'Sinter Plant', type: 'Sintering', position: { x: -4, y: 0, z: 0 }, size: { width: 2, depth: 2, height: 0.1 }, color: '#3b4f6b', minOperators: 1 },
];
