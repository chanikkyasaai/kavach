import { useStore } from '../store/useStore';
import type { IPLState } from '../store/useStore';
import { getIPLColor, getRiskColor, getRiskLevel } from '../utils/lopa';
import './LeftPanel.css';

export default function LeftPanel() {
  const { ipls, compoundRisk, simopsConflicts } = useStore();
  const riskColor = getRiskColor(compoundRisk);
  const riskLevel = getRiskLevel(compoundRisk);

  return (
    <div className="left-panel">
      <div className="panel-header">
        <span className="panel-title">PROTECTION LAYERS</span>
        <span className="panel-subtitle">LOPA / IEC 61511</span>
      </div>

      <div className="compound-gauge">
        <svg viewBox="0 0 120 80" className="gauge-svg">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="75%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path
            d="M 15 65 A 45 45 0 0 1 105 65"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 15 65 A 45 45 0 0 1 105 65"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(compoundRisk / 100) * 141} 141`}
          />
          <text x="60" y="58" textAnchor="middle" fill={riskColor} fontSize="22" fontWeight="bold" fontFamily="JetBrains Mono">
            {compoundRisk}
          </text>
          <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" letterSpacing="1">
            {riskLevel.toUpperCase()}
          </text>
        </svg>
      </div>

      <div className="ipl-list">
        {ipls.map((ipl, idx) => (
          <IPLIndicator key={ipl.id} ipl={ipl} index={idx + 1} />
        ))}
      </div>

      {simopsConflicts.length > 0 && (
        <div className="simops-alert">
          <div className="simops-header">
            <span className="simops-icon">⚠</span>
            <span className="simops-title">SIMOPS CONFLICT</span>
          </div>
          {simopsConflicts.map((conflict, i) => (
            <p key={i} className="simops-detail">{conflict}</p>
          ))}
          <span className="simops-rule">OISD-STD-105 Rule 4.3.2</span>
        </div>
      )}
    </div>
  );
}

function IPLIndicator({ ipl, index }: { ipl: IPLState; index: number }) {
  const color = getIPLColor(ipl.score);
  const pct = ipl.score;

  return (
    <div className="ipl-item">
      <div className="ipl-header">
        <span className="ipl-number">IPL-{index}</span>
        <span className="ipl-name">{ipl.shortName}</span>
        <span className="ipl-score mono" style={{ color }}>{pct}</span>
      </div>
      <div className="ipl-bar">
        <div
          className="ipl-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <p className="ipl-factors">{ipl.factors.split('.')[0]}.</p>
    </div>
  );
}
