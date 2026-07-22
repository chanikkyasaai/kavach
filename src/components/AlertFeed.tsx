import { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { formatTime } from '../utils/lopa';
import CornerBrackets from './CornerBrackets';
import './AlertFeed.css';

const PRIORITY_LABEL: Record<string, string> = {
  critical: 'P1',
  amber: 'P2',
  info: 'P3',
};

export default function AlertFeed() {
  const alerts = useStore(s => s.alerts);
  const acknowledgeAlert = useStore(s => s.acknowledgeAlert);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [alerts.length]);

  const sortedAlerts = [...alerts].reverse();
  const unackCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="alert-feed glass-panel">
      <CornerBrackets />
      <div className="alert-feed-header panel-header-bar">
        <span>
          <span className="panel-glyph">◈</span>
          <span className="alert-feed-title">ALERT FEED</span>
        </span>
        <span className="panel-header-right">
          {unackCount > 0 && <span className="alert-count">{unackCount}</span>}
          <span className="panel-live-dot" />
        </span>
      </div>
      <div className="alert-feed-list" ref={scrollRef}>
        {sortedAlerts.length === 0 && (
          <div className="alert-empty">System nominal. No alerts.</div>
        )}
        {sortedAlerts.map(alert => (
          <div
            key={alert.id}
            className={`alert-card alert-${alert.level} ${alert.acknowledged ? 'acknowledged' : ''}`}
          >
            <CornerBrackets size={10} thickness={1} />
            <span className="alert-priority-badge">{PRIORITY_LABEL[alert.level]}</span>
            <div className="alert-card-header">
              <span className={`alert-level-badge ${alert.level}`}>
                {alert.level === 'critical' ? '🚨' : alert.level === 'amber' ? '⚠️' : 'ℹ️'}
              </span>
              <span className="alert-card-title mono">
                {alert.title}
                {!alert.acknowledged && <span className="alert-cursor">█</span>}
              </span>
              <span className="alert-time mono">{formatTime(alert.timestamp)}</span>
            </div>
            <p className="alert-desc">{alert.description}</p>
            {!alert.acknowledged && alert.level !== 'info' && (
              <button className="alert-ack-btn" onClick={() => acknowledgeAlert(alert.id)}>
                ACK
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
