import type { Worker } from './workers';

// The 4 demo workers whose QR codes are printed for the Camera Intelligence
// demo (see /qr-codes). Positioned within Z1 — Steel Melt Shop, near the
// ladle bay the camera panel is framed on.
export const cameraWorkers: Worker[] = [
  { id: 'W001', name: 'G.V. Appa Rao', role: 'Furnace Technician', type: 'permanent', employer: 'VSP', zone: 'Z1', trained: true, trainingExpiry: '2026-11-10', language: 'Telugu', checkInTime: '--:--', position: { x: 8.4, y: 0.1, z: 1.9 } },
  { id: 'W002', name: 'Bheem Kumar', role: 'SMS Hazard Class Contractor', type: 'contract', employer: 'Steel City Contractors', zone: 'Z1', trained: false, trainingExpiry: '2026-04-22', language: 'Odia', checkInTime: '--:--', position: { x: 4.8, y: 0.1, z: -0.8 } },
  { id: 'W003', name: 'R. Narasimha', role: 'Ladle Bay Supervisor', type: 'permanent', employer: 'VSP', zone: 'Z1', trained: true, trainingExpiry: '2027-02-18', language: 'Telugu', checkInTime: '--:--', position: { x: 6.9, y: 0.1, z: 1.1 } },
  { id: 'W004', name: 'Sanjay Oram', role: 'Rigger', type: 'contract', employer: 'Steel City Contractors', zone: 'Z1', trained: true, trainingExpiry: '2026-10-22', language: 'Odia', checkInTime: '--:--', position: { x: 5.6, y: 0.1, z: 2.1 } },
];
