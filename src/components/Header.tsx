import { useStore } from '../store/useStore';
import { getRiskColor, formatTime } from '../utils/lopa';
import './Header.css';

export default function Header() {
  const compoundRisk = useStore(s => s.compoundRisk);
  const scenarioTime = useStore(s => s.scenarioTime);
  const isPlaying = useStore(s => s.isPlaying);
  const speedMultiplier = useStore(s => s.speedMultiplier);
  const startScenario = useStore(s => s.startScenario);
  const pauseScenario = useStore(s => s.pauseScenario);
  const resetScenario = useStore(s => s.resetScenario);
  const setSpeed = useStore(s => s.setSpeed);
  const soundMuted = useStore(s => s.soundMuted);
  const toggleSoundMuted = useStore(s => s.toggleSoundMuted);

  const riskColor = getRiskColor(compoundRisk);
  const isCritical = compoundRisk >= 85;
  const isHigh = compoundRisk >= 70;
  const hasStarted = scenarioTime > 0 || isPlaying;

  return (
    <header className={`header ${isCritical ? 'header-critical' : isHigh ? 'header-high' : ''}`}>
      <div className="header-left">
        <div className="logo">
          <div className="logo-shield">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M16 2 L28 8 L28 20 L16 28 L4 20 L4 8 Z" stroke="#06b6d4" strokeWidth="1.5" fill="none"/>
              <path d="M16 6 L24 10 L24 18 L16 24 L8 18 L8 10 Z" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.6"/>
              <circle cx="16" cy="15" r="3" fill="#06b6d4" opacity="0.8"/>
            </svg>
          </div>
          <div className="logo-text-group">
            <span className="logo-text">KAVACH</span>
            <span className="logo-subtitle">INDUSTRIAL SAFETY INTELLIGENCE</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className={`compound-risk-display ${isCritical ? 'risk-critical-state' : ''}`}>
          <div className="risk-left">
            <span className="risk-label">COMPOUND RISK</span>
            <div className="risk-bar-container">
              <div className="risk-bar">
                <div
                  className="risk-bar-fill"
                  style={{ width: `${compoundRisk}%`, background: `linear-gradient(90deg, #10b981, ${riskColor})` }}
                />
                <div className="risk-bar-marker" style={{ left: '70%' }} />
                <div className="risk-bar-marker critical-marker" style={{ left: '85%' }} />
              </div>
            </div>
          </div>
          <div className={`risk-score ${isCritical ? 'risk-score-critical' : ''}`} style={{ color: riskColor }}>
            {compoundRisk}
          </div>
          {isCritical && <span className="risk-badge critical-badge">CRITICAL</span>}
          {isHigh && !isCritical && <span className="risk-badge high-badge">ELEVATED</span>}
        </div>
      </div>

      <div className="header-right">
        <button
          className={`mute-btn ${soundMuted ? 'muted' : ''}`}
          onClick={toggleSoundMuted}
          title={soundMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
        >
          {soundMuted ? '🔇' : '🔊'}
        </button>
        <div className="scenario-block">
          <div className="scenario-info">
            <span className="scenario-label">VSP INCIDENT REPLAY — JUNE 8, 2026</span>
            <div className="scenario-time-row">
              <span className="scenario-time mono">{formatTime(scenarioTime)}</span>
              <span className="scenario-progress mono">T+{Math.floor(scenarioTime)}m</span>
            </div>
          </div>
          <div className="scenario-controls">
            {!hasStarted ? (
              <button
                className="launch-btn"
                onClick={startScenario}
                title="Begin Incident Replay"
              >
                <span className="launch-icon">▶</span>
                <span className="launch-label">LAUNCH REPLAY</span>
              </button>
            ) : (
              <>
                <button
                  className={`ctrl-btn play-btn ${isPlaying ? 'playing' : ''}`}
                  onClick={isPlaying ? pauseScenario : startScenario}
                  title={isPlaying ? 'Pause' : 'Resume'}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button className="ctrl-btn" onClick={resetScenario} title="Reset">
                  ↺
                </button>
                <select
                  className="speed-select mono"
                  value={speedMultiplier}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                >
                  <option value={5}>5×</option>
                  <option value={10}>10×</option>
                  <option value={20}>20×</option>
                  <option value={30}>30×</option>
                </select>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
