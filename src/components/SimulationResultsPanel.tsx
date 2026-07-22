import { useState } from 'react';
import type { IPLState } from '../store/useStore';
import { IPL_LABELS } from '../data/causalGraph';
import { estimateIncidentProbability, generateScenarioNarrative } from '../utils/causalEngine';
import type { SimulationVariables } from '../utils/causalEngine';
import CornerBrackets from './CornerBrackets';
import './SimulationResultsPanel.css';

interface Props {
  liveIpls: IPLState[];
  liveCompoundRisk: number;
  simIplScores: Record<string, number>;
  simCompoundRisk: number;
  variables: SimulationVariables;
  isRunningForward: boolean;
  runForwardTime: number;
  onStartRunForward: () => void;
  onPauseRunForward: () => void;
  onResetRunForward: () => void;
  onPushToLive: () => void;
}

export default function SimulationResultsPanel({
  liveIpls,
  liveCompoundRisk,
  simIplScores,
  simCompoundRisk,
  variables,
  isRunningForward,
  runForwardTime,
  onStartRunForward,
  onPauseRunForward,
  onResetRunForward,
  onPushToLive,
}: Props) {
  const [confirmingPush, setConfirmingPush] = useState(false);

  const incidentProbability = estimateIncidentProbability(simCompoundRisk);
  const narrative = generateScenarioNarrative(variables, simIplScores, simCompoundRisk, IPL_LABELS);

  return (
    <div className="sim-results-panel glass-panel">
      <CornerBrackets />
      <div className="srp-header panel-header-bar">
        <span>
          <span className="panel-glyph">◈</span>
          <span className="srp-title">SIMULATION RESULTS</span>
        </span>
        <span className="panel-live-dot" />
      </div>

      <div className="srp-score-row">
        <div className="srp-score-block">
          <span className="srp-score-label">LIVE</span>
          <span className="srp-score-value mono">{liveCompoundRisk}</span>
        </div>
        <span className="srp-score-arrow">→</span>
        <div className="srp-score-block srp-score-block-sim">
          <span className="srp-score-label">SIMULATED</span>
          <span className="srp-score-value srp-score-value-sim mono">{simCompoundRisk}</span>
        </div>
      </div>

      <div className="srp-ipl-table">
        <div className="srp-ipl-row srp-ipl-head">
          <span>IPL</span><span>Live</span><span>Sim</span><span>Δ</span>
        </div>
        {liveIpls.map(ipl => {
          const simScore = simIplScores[ipl.id] ?? ipl.score;
          const delta = simScore - ipl.score;
          return (
            <div key={ipl.id} className="srp-ipl-row">
              <span>{ipl.shortName}</span>
              <span className="mono">{ipl.score}</span>
              <span className="mono">{simScore}</span>
              <span className={`mono srp-delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>
                {delta > 0 ? '+' : ''}{delta}
              </span>
            </div>
          );
        })}
      </div>

      <div className="srp-probability">
        <span className="srp-probability-label">INCIDENT PROBABILITY (NEXT 60 MIN)</span>
        <div className="srp-probability-bar">
          <div className="srp-probability-fill" style={{ width: `${incidentProbability}%` }} />
        </div>
        <span className="srp-probability-value mono">{incidentProbability}%</span>
      </div>

      <p className="srp-narrative">{narrative}</p>

      <div className="srp-run-forward">
        <div className="srp-run-forward-header">
          <span>RUN FORWARD</span>
          <span className="mono">T+{Math.floor(runForwardTime)}m / 45m</span>
        </div>
        <div className="srp-run-forward-bar">
          <div className="srp-run-forward-fill" style={{ width: `${(runForwardTime / 45) * 100}%` }} />
        </div>
        <div className="srp-run-forward-controls">
          <button className="srp-btn" onClick={isRunningForward ? onPauseRunForward : onStartRunForward}>
            {isRunningForward ? '⏸ PAUSE' : '▶ RUN FORWARD (10×)'}
          </button>
          <button className="srp-btn srp-btn-ghost" onClick={onResetRunForward}>↺ RESET</button>
        </div>
      </div>

      <div className="srp-push-live">
        {!confirmingPush ? (
          <button className="srp-push-btn" onClick={() => setConfirmingPush(true)}>
            APPLY THESE CONDITIONS TO LIVE SCENARIO
          </button>
        ) : (
          <div className="srp-push-confirm">
            <p>This overwrites live IPL scores with the simulated values. Confirm?</p>
            <div className="srp-push-confirm-actions">
              <button
                className="srp-push-btn"
                onClick={() => { onPushToLive(); setConfirmingPush(false); }}
              >
                CONFIRM
              </button>
              <button className="srp-btn srp-btn-ghost" onClick={() => setConfirmingPush(false)}>CANCEL</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
