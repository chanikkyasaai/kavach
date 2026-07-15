export interface Intervention {
  id: string;
  title: string;
  fixesIplId: string;
  fixesIplLabel: string;
  restoredScore: number;
  restoredFactors: string;
  implementationMinutes: number;
  who: string;
  complianceNote: string;
  suspendsPermits?: string[];
}

export const interventions: Intervention[] = [
  {
    id: 'suspend-ptw',
    title: 'Suspend PTW-437 + PTW-438',
    fixesIplId: 'ipl3',
    fixesIplLabel: 'IPL-3 PTW',
    restoredScore: 82,
    restoredFactors: 'PTW-437 and PTW-438 suspended. SIMOPS conflict resolved — hot work and confined space entry no longer concurrent in Z1.',
    implementationMinutes: 3,
    who: 'Shift Supervisor + Area Controller',
    complianceNote: 'OISD-STD-105 Clause 7.4 violation resolved',
    suspendsPermits: ['PTW-437', 'PTW-438'],
  },
  {
    id: 'evacuate-z1',
    title: 'Evacuate Zone Z1',
    fixesIplId: 'ipl5',
    fixesIplLabel: 'IPL-5 HF',
    restoredScore: 90,
    restoredFactors: 'Zone Z1 evacuated. No personnel in affected area pending resolution.',
    implementationMinutes: 5,
    who: 'Area Controller + Emergency Response Team',
    complianceNote: 'Factory Act Section 22 duty of care discharged',
  },
  {
    id: 'sms1-shutdown',
    title: 'Initiate SMS-1 Controlled Shutdown',
    fixesIplId: 'ipl1',
    fixesIplLabel: 'IPL-1 BPCS',
    restoredScore: 75,
    restoredFactors: 'Controlled shutdown (SMS-1) initiated. BPCS sensors returning to safe operating envelope.',
    implementationMinutes: 12,
    who: 'Plant Manager + Control Room',
    complianceNote: 'OISD-STD-105 emergency shutdown protocol invoked',
  },
];

export const bowTieThreats = [
  { id: 'threat-co', label: 'CO Gas Accumulation', sourceIplId: 'ipl1' },
  { id: 'threat-hotwork', label: 'Hot Work in Adjacent Zone', sourceIplId: 'ipl3' },
  { id: 'threat-pressure', label: 'Pressure Anomaly — Ladle', sourceIplId: 'ipl1' },
];

export const bowTieTopEvent = 'UNCONTROLLED IGNITION / LADLE EXPLOSION';

export const bowTieConsequences = [
  'Blast injury to workers in zone',
  'Secondary explosion (precursor → fatal event pattern)',
  'Gas release to adjacent zones',
];
