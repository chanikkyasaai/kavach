export interface Worker {
  id: string;
  name: string;
  role: string;
  type: 'permanent' | 'contract';
  employer: string;
  zone: string;
  trained: boolean;
  trainingExpiry: string;
  language: string;
  checkInTime: string;
  position: { x: number; y: number; z: number };
}

export const workers: Worker[] = [
  { id: 'W01', name: 'Rajesh Kumar', role: 'Furnace Operator', type: 'permanent', employer: 'VSP', zone: 'Z1', trained: true, trainingExpiry: '2026-12-15', language: 'Telugu', checkInTime: '06:00', position: { x: -2.5, y: 0.1, z: -2.5 } },
  { id: 'W02', name: 'Mohammed Ismail', role: 'Ladle Operator', type: 'permanent', employer: 'VSP', zone: 'Z1', trained: true, trainingExpiry: '2026-09-20', language: 'Telugu', checkInTime: '06:00', position: { x: -1.5, y: 0.1, z: -1.5 } },
  { id: 'W03', name: 'Suresh Patel', role: 'Welder', type: 'contract', employer: 'Tata Projects Ltd', zone: 'Z1', trained: true, trainingExpiry: '2026-08-10', language: 'Hindi', checkInTime: '07:30', position: { x: -0.5, y: 0.1, z: -2 } },
  { id: 'W04', name: 'Bikash Mahato', role: 'Helper', type: 'contract', employer: 'Durga Enterprises', zone: 'Z1', trained: false, trainingExpiry: '2026-03-01', language: 'Odia', checkInTime: '07:30', position: { x: -3, y: 0.1, z: -1 } },
  { id: 'W05', name: 'Venkat Rao', role: 'Safety Marshal', type: 'permanent', employer: 'VSP', zone: 'Z2', trained: true, trainingExpiry: '2027-01-30', language: 'Telugu', checkInTime: '06:00', position: { x: 2.5, y: 0.1, z: -1.5 } },
  { id: 'W06', name: 'Anand Singh', role: 'Fitter', type: 'contract', employer: 'KEC International', zone: 'Z2', trained: true, trainingExpiry: '2026-11-05', language: 'Hindi', checkInTime: '08:00', position: { x: 3.5, y: 0.1, z: -0.5 } },
  { id: 'W07', name: 'Ravi Shankar', role: 'Electrician', type: 'contract', employer: 'Durga Enterprises', zone: 'Z3', trained: false, trainingExpiry: '2026-02-15', language: 'Bengali', checkInTime: '07:30', position: { x: -2.5, y: 0.1, z: 2 } },
  { id: 'W08', name: 'P. Nagaraju', role: 'Crane Operator', type: 'permanent', employer: 'VSP', zone: 'Z4', trained: true, trainingExpiry: '2026-10-28', language: 'Telugu', checkInTime: '06:00', position: { x: 1, y: 0.1, z: 2.5 } },
  { id: 'W09', name: 'Dinesh Yadav', role: 'Rigger', type: 'contract', employer: 'Tata Projects Ltd', zone: 'Z4', trained: true, trainingExpiry: '2026-07-12', language: 'Hindi', checkInTime: '08:00', position: { x: 1.5, y: 0.1, z: 1.5 } },
  { id: 'W10', name: 'Manoj Behera', role: 'Gas Cutter', type: 'contract', employer: 'KEC International', zone: 'Z5', trained: true, trainingExpiry: '2026-09-30', language: 'Odia', checkInTime: '07:30', position: { x: 3.5, y: 0.1, z: 0.5 } },
  { id: 'W11', name: 'K. Srinivas', role: 'Shift Supervisor', type: 'permanent', employer: 'VSP', zone: 'Z1', trained: true, trainingExpiry: '2027-03-15', language: 'Telugu', checkInTime: '06:00', position: { x: -2, y: 0.1, z: -3 } },
  { id: 'W12', name: 'Tapan Das', role: 'Helper', type: 'contract', employer: 'Durga Enterprises', zone: 'Z3', trained: false, trainingExpiry: '2026-01-20', language: 'Bengali', checkInTime: '07:30', position: { x: -3.5, y: 0.1, z: 1.5 } },
];
