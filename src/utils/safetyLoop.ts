import type { IPLState } from '../store/useStore';
import type { Intervention } from '../data/interventions';
import { calculateCompoundRisk } from './lopa';

export interface RankedIntervention extends Intervention {
  projectedRisk: number;
  riskReduction: number;
  score: number;
}

export function projectRiskAfterIntervention(ipls: IPLState[], intervention: Intervention): number {
  const hypothetical = ipls.map(ipl =>
    ipl.id === intervention.fixesIplId ? { ...ipl, score: intervention.restoredScore } : ipl
  );
  return calculateCompoundRisk(hypothetical);
}

export function rankInterventions(
  ipls: IPLState[],
  compoundRisk: number,
  candidates: Intervention[]
): RankedIntervention[] {
  return candidates
    .map(intervention => {
      const projectedRisk = projectRiskAfterIntervention(ipls, intervention);
      const riskReduction = compoundRisk - projectedRisk;
      return {
        ...intervention,
        projectedRisk,
        riskReduction,
        score: riskReduction / intervention.implementationMinutes,
      };
    })
    .sort((a, b) => b.score - a.score);
}
