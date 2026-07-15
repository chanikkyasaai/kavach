export interface Equipment {
  id: string;
  name: string;
  zone: string;
  type: string;
  lastInspection: string;
  nextInspection: string;
  designLife: number;
  age: number;
  criticalWorkOrders: number;
  position: { x: number; y: number; z: number };
}

export const equipment: Equipment[] = [
  { id: 'EQ01', name: 'BOF Converter #1', zone: 'Z1', type: 'Pressure Vessel', lastInspection: '2026-03-15', nextInspection: '2026-06-15', designLife: 25, age: 18, criticalWorkOrders: 2, position: { x: -2.5, y: 0, z: -2 } },
  { id: 'EQ02', name: 'Ladle Turret', zone: 'Z1', type: 'Rotating Equipment', lastInspection: '2026-04-01', nextInspection: '2026-07-01', designLife: 20, age: 12, criticalWorkOrders: 1, position: { x: -1, y: 0, z: -2.5 } },
  { id: 'EQ03', name: 'Gas Holder #3', zone: 'Z2', type: 'Storage Vessel', lastInspection: '2026-01-20', nextInspection: '2026-04-20', designLife: 30, age: 22, criticalWorkOrders: 3, position: { x: 3, y: 0, z: -1.5 } },
  { id: 'EQ04', name: 'Coke Oven Battery B', zone: 'Z3', type: 'Process Equipment', lastInspection: '2026-05-10', nextInspection: '2026-08-10', designLife: 25, age: 19, criticalWorkOrders: 0, position: { x: -3, y: 0, z: 2 } },
  { id: 'EQ05', name: 'Continuous Caster #2', zone: 'Z4', type: 'Casting Equipment', lastInspection: '2026-05-28', nextInspection: '2026-08-28', designLife: 20, age: 8, criticalWorkOrders: 0, position: { x: 1.5, y: 0, z: 2 } },
  { id: 'EQ06', name: 'Hot Rolling Mill', zone: 'Z5', type: 'Rolling Equipment', lastInspection: '2026-04-15', nextInspection: '2026-07-15', designLife: 30, age: 15, criticalWorkOrders: 1, position: { x: 3.5, y: 0, z: 0.5 } },
];
