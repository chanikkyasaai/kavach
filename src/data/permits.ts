export interface Permit {
  id: string;
  type: 'hot_work' | 'confined_space' | 'electrical' | 'excavation' | 'height';
  zone: string;
  description: string;
  issuer: string;
  holder: string;
  phsaComplete: boolean;
  isolationsVerified: boolean;
  startTime: string;
  endTime: string;
  status: 'active' | 'suspended' | 'completed';
}

export const permits: Permit[] = [
  {
    id: 'PTW-437',
    type: 'hot_work',
    zone: 'Z1',
    description: 'Welding repair on ladle transfer car rail',
    issuer: 'K. Srinivas',
    holder: 'Suresh Patel',
    phsaComplete: true,
    isolationsVerified: true,
    startTime: '08:00',
    endTime: '16:00',
    status: 'active',
  },
  {
    id: 'PTW-438',
    type: 'confined_space',
    zone: 'Z1',
    description: 'Internal inspection of ladle shell #4',
    issuer: 'K. Srinivas',
    holder: 'Bikash Mahato',
    phsaComplete: false,
    isolationsVerified: false,
    startTime: '09:00',
    endTime: '14:00',
    status: 'active',
  },
  {
    id: 'PTW-441',
    type: 'hot_work',
    zone: 'Z3',
    description: 'Gas cutting for coke oven door replacement',
    issuer: 'Venkat Rao',
    holder: 'Ravi Shankar',
    phsaComplete: true,
    isolationsVerified: true,
    startTime: '10:00',
    endTime: '15:00',
    status: 'active',
  },
  {
    id: 'PTW-442',
    type: 'electrical',
    zone: 'Z5',
    description: 'Motor replacement on rolling mill drive',
    issuer: 'Venkat Rao',
    holder: 'Manoj Behera',
    phsaComplete: true,
    isolationsVerified: true,
    startTime: '08:30',
    endTime: '17:00',
    status: 'active',
  },
];
