import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { getRiskColor } from '../utils/lopa';
import DataIntegrationPanel from './DataIntegrationPanel';
import CornerBrackets from './CornerBrackets';
import AnimatedNumber from './AnimatedNumber';
import './Header.css';

// Local-only, display-purposes formatting — derives HH:MM from scenarioTime
// (minutes) without touching the shared formatTime/store.
function formatClock(minutes: number): { h: string; m: string } {
  const baseHour = 15;
  const totalMinutes = Math.floor(minutes);
  const h = baseHour + Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return { h: h.toString().padStart(2, '0'), m: m.toString().padStart(2, '0') };
}

export default function Header() {
  const [dataPanelOpen, setDataPanelOpen] = useState(false);
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

  // Purely decorative "alive" seconds digit — always ticking in real time,
  // independent of scenario play state. Not tied to scenarioTime/store.
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setSeconds(s => (s + 1) % 60), 1000);
    return () => window.clearInterval(id);
  }, []);

  const riskColor = getRiskColor(compoundRisk);
  const isCritical = compoundRisk >= 85;
  const isHigh = compoundRisk >= 70;
  const hasStarted = scenarioTime > 0 || isPlaying;
  const clock = formatClock(scenarioTime);

  return (
    <header className={`header ${isCritical ? 'header-critical' : isHigh ? 'header-high' : ''}`}>
      <div className="header-left">
        <div className="logo">
          <div className="logo-shield">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M16 2 L28 8 L28 20 L16 28 L4 20 L4 8 Z" stroke="#00b4ff" strokeWidth="1.5" fill="none"/>
              <path d="M16 6 L24 10 L24 18 L16 24 L8 18 L8 10 Z" stroke="#00b4ff" strokeWidth="1" fill="none" opacity="0.5"/>
              <circle cx="16" cy="15" r="3" fill="#00b4ff" opacity="0.9"/>
            </svg>
          </div>
          <div className="logo-text-group">
            <span className="logo-text">KAVACH</span>
            <span className="logo-subtitle">INDUSTRIAL SAFETY INTELLIGENCE</span>
          </div>
        </div>
      </div>

      <div className="header-section-divider" />

      <div className="header-center">
        <div
          className={`compound-risk-display ${isCritical ? 'risk-critical-state' : ''}`}
          style={{ borderLeftColor: riskColor, borderRightColor: riskColor }}
        >
          <CornerBrackets size={10} />
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
            <AnimatedNumber value={compoundRisk} />
          </div>
          {isCritical && <span className="risk-badge critical-badge">CRITICAL</span>}
          {isHigh && !isCritical && <span className="risk-badge high-badge">ELEVATED</span>}
        </div>
      </div>

      <div className="header-section-divider" />

      <div className="header-right">
        <button
          className="data-sources-btn"
          onClick={() => setDataPanelOpen(true)}
          title="Data Integration Architecture"
        >
          ⛓ DATA SOURCES
        </button>
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
              <span className="scenario-clock mono">
                <span className="clock-segment">{clock.h}</span>
                <span className="clock-sep" />
                <span className="clock-segment">{clock.m}</span>
                <span className="clock-sep" />
                <span className="clock-segment clock-seconds">
                  {seconds.toString().padStart(2, '0')}
                </span>
              </span>
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

      {dataPanelOpen && <DataIntegrationPanel onClose={() => setDataPanelOpen(false)} />}
    </header>
  );
}
