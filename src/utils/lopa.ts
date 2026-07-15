import type { IPLState } from '../store/useStore';

export function calculateCompoundRisk(ipls: IPLState[]): number {
  const product = ipls.reduce((acc, ipl) => acc * (ipl.score / 100), 1);
  return Math.round(100 * (1 - product));
}

export function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 50) return 'low';
  if (score < 70) return 'medium';
  if (score < 85) return 'high';
  return 'critical';
}

export function getRiskColor(score: number): string {
  if (score < 50) return '#10b981';
  if (score < 70) return '#f59e0b';
  if (score < 85) return '#f97316';
  return '#ef4444';
}

export type EdgeState = 'normal' | 'warning' | 'critical' | 'emergency';

export function getEdgeState(compoundRisk: number): EdgeState {
  if (compoundRisk >= 90) return 'emergency';
  if (compoundRisk >= 70) return 'critical';
  if (compoundRisk >= 40) return 'warning';
  return 'normal';
}

export function getIPLColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

export function formatTime(minutes: number): string {
  const baseHour = 15; // 3:00 PM scenario start
  const totalMinutes = Math.floor(minutes);
  const hours = baseHour + Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
