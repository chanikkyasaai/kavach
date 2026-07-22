import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { IPLState } from '../store/useStore';
import { getRiskColor, getRiskLevel } from '../utils/lopa';
import RadialGauge from './RadialGauge';
import CornerBrackets from './CornerBrackets';
import './LeftPanel.css';

export default function LeftPanel() {
  const { ipls, compoundRisk, simopsConflicts } = useStore();
  const riskColor = getRiskColor(compoundRisk);
  const riskLevel = getRiskLevel(compoundRisk);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`left-panel ${collapsed ? 'panel-collapsed' : ''}`}>
      <button
        className="panel-minimize-btn"
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? 'Expand protection layers' : 'Minimize protection layers'}
      >
        {collapsed ? '›' : '‹'}
      </button>
      {!collapsed && (
        <>
          <CornerBrackets />
          <div className="panel-header panel-header-bar">
            <span>
              <span className="panel-glyph">◈</span>
              <span className="panel-title">PROTECTION LAYERS</span>
            </span>
            <span className="panel-header-right">
              <span className="panel-subtitle">LOPA / IEC 61511</span>
              <span className="panel-live-dot" />
            </span>
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
        </>
      )}
    </div>
  );
}

function IPLIndicator({ ipl, index }: { ipl: IPLState; index: number }) {
  return (
    <div className="ipl-item">
      <RadialGauge score={ipl.score} />
      <div className="ipl-item-info">
        <div className="ipl-header">
          <span className="ipl-number">IPL-{index}</span>
          <span className="ipl-name">{ipl.shortName}</span>
        </div>
        <p className="ipl-factors">{ipl.factors.split('.')[0]}.</p>
      </div>
    </div>
  );
}
