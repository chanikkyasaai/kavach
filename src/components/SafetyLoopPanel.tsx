import { useState } from 'react';
import { useStore } from '../store/useStore';
import { interventions } from '../data/interventions';
import type { Intervention } from '../data/interventions';
import { rankInterventions } from '../utils/safetyLoop';
import type { RankedIntervention } from '../utils/safetyLoop';
import { formatTime } from '../utils/lopa';
import BowTie from './BowTie';
import CornerBrackets from './CornerBrackets';
import './SafetyLoopPanel.css';

export default function SafetyLoopPanel() {
  const ipls = useStore(s => s.ipls);
  const compoundRisk = useStore(s => s.compoundRisk);
  const scenarioTime = useStore(s => s.scenarioTime);
  const executedInterventions = useStore(s => s.executedInterventions);
  const executeIntervention = useStore(s => s.executeIntervention);

  const [pendingId, setPendingId] = useState<string | null>(null);

  const pendingCandidates = interventions.filter(i => !executedInterventions.includes(i.id));
  const ranked = rankInterventions(ipls, compoundRisk, pendingCandidates);
  const executed = interventions.filter(i => executedInterventions.includes(i.id));

  const pending = pendingId ? interventions.find(i => i.id === pendingId) ?? null : null;
  const pendingProjection = pending ? rankInterventions(ipls, compoundRisk, [pending])[0] : null;

  return (
    <div className="safety-loop-panel">
      <div className="safety-loop-left glass-panel">
        <CornerBrackets />
        <BowTie ipls={ipls} compoundRisk={compoundRisk} />
      </div>

      <div className="safety-loop-right glass-panel">
        <CornerBrackets />
        <div className="sl-header panel-header-bar">
          <span>
            <span className="panel-glyph">◈</span>
            <span className="sl-title">REACTIVE INTERVENTION EXECUTOR</span>
          </span>
          <span className="panel-header-right">
            <span className="sl-subtitle">Ranked by risk reduction ÷ time to implement</span>
            <span className="panel-live-dot" />
          </span>
        </div>

        <div className="sl-cards">
          {ranked.map((intervention, idx) => (
            <InterventionCard
              key={intervention.id}
              intervention={intervention}
              priority={idx + 1}
              currentRisk={compoundRisk}
              onExecute={() => setPendingId(intervention.id)}
            />
          ))}
          {executed.map(intervention => (
            <InterventionCard
              key={intervention.id}
              intervention={intervention}
              currentRisk={compoundRisk}
              executed
            />
          ))}
        </div>
      </div>

      {pending && pendingProjection && (
        <div className="sl-modal-overlay" onClick={() => setPendingId(null)}>
          <div className="sl-modal" onClick={e => e.stopPropagation()}>
            <CornerBrackets size={10} />
            <h3 className="sl-modal-title">EXECUTE: {pending.title}</h3>
            <p className="sl-modal-row"><span>This will:</span> {pending.restoredFactors}</p>
            <p className="sl-modal-row"><span>By:</span> {pending.who} at {formatTime(scenarioTime)}</p>
            <p className="sl-modal-row sl-modal-projection">
              <span>Projected risk reduction:</span> {compoundRisk} → {pendingProjection.projectedRisk}
            </p>
            <div className="sl-modal-actions">
              <button
                className="sl-confirm-btn"
                onClick={() => { executeIntervention(pending.id); setPendingId(null); }}
              >
                CONFIRM EXECUTION
              </button>
              <button className="sl-cancel-btn" onClick={() => setPendingId(null)}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface InterventionCardProps {
  intervention: Intervention | RankedIntervention;
  currentRisk: number;
  priority?: number;
  executed?: boolean;
  onExecute?: () => void;
}

function InterventionCard({ intervention, currentRisk, priority, executed, onExecute }: InterventionCardProps) {
  const ranked = 'projectedRisk' in intervention ? intervention : null;

  return (
    <div className={`intervention-card ${executed ? 'ic-executed' : ''}`}>
      <CornerBrackets size={8} thickness={1} />
      <div className="ic-header">
        <span className={`ic-priority ${executed ? 'ic-done-badge' : `ic-priority-${priority}`}`}>
          {executed ? '✓ EXECUTED' : `PRIORITY ${priority}`}
        </span>
      </div>
      <p className="ic-title">{intervention.title}</p>

      <p className="ic-row"><span className="ic-label">Fixes:</span> {intervention.fixesIplLabel} → {intervention.restoredScore}</p>

      {ranked && (
        <div className="ic-risk-block">
          <div className="ic-risk-values">
            <span className="ic-label">Risk after:</span>
            <span className="mono">{currentRisk} → {ranked.projectedRisk}</span>
          </div>
          <div className="ic-risk-bar">
            <div className="ic-risk-bar-fill" style={{ width: `${ranked.projectedRisk}%` }} />
          </div>
        </div>
      )}

      <p className="ic-row"><span className="ic-label">Time to implement:</span> {intervention.implementationMinutes} min</p>
      <p className="ic-row"><span className="ic-label">Who:</span> {intervention.who}</p>
      {intervention.suspendsPermits && (
        <p className="ic-row"><span className="ic-label">Suspends:</span> {intervention.suspendsPermits.join(', ')}</p>
      )}

      <p className="ic-compliance">{intervention.complianceNote}</p>

      {!executed && (
        <button className="ic-execute-btn" onClick={onExecute}>
          EXECUTE NOW
        </button>
      )}
    </div>
  );
}
