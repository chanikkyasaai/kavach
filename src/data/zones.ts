export interface Zone {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  size: { width: number; depth: number; height: number };
  color: string;
  minOperators: number;
}

// Positions follow VSP's real west→east production flow:
// Raw Material → Coke Ovens → Sinter → Blast Furnace → SMS → Casting → Rolling Mills.
// Zone IDs (Z1-Z6) are preserved from the original model so sensors/workers/permits/
// equipment data (which reference these IDs) keep working unchanged.
export const zones: Zone[] = [
  { id: 'Z3', name: 'Coke Oven & Coal Chemical Plant', type: 'Processing', position: { x: -11, y: 0, z: -1 }, size: { width: 7, depth: 3, height: 0.1 }, color: '#3b4f6b', minOperators: 2 },
  { id: 'Z6', name: 'Sinter Plant', type: 'Sintering', position: { x: -6, y: 0, z: 3 }, size: { width: 4, depth: 3, height: 0.1 }, color: '#3b4f6b', minOperators: 1 },
  { id: 'Z2', name: 'Blast Furnace Complex', type: 'Smelting', position: { x: 0, y: 0, z: -1 }, size: { width: 6, depth: 6, height: 0.1 }, color: '#3b4f6b', minOperators: 2 },
  { id: 'Z1', name: 'Steel Melt Shop', type: 'Melting', position: { x: 6.5, y: 0, z: 0 }, size: { width: 7, depth: 5, height: 0.1 }, color: '#3b4f6b', minOperators: 3 },
  { id: 'Z4', name: 'Continuous Casting', type: 'Casting', position: { x: 11, y: 0, z: 3 }, size: { width: 4, depth: 3, height: 0.1 }, color: '#3b4f6b', minOperators: 2 },
  { id: 'Z5', name: 'Rolling Mills', type: 'Rolling', position: { x: 16, y: 0, z: 0 }, size: { width: 6, depth: 4, height: 0.1 }, color: '#3b4f6b', minOperators: 1 },
];
