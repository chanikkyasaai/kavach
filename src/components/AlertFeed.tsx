import { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { formatTime } from '../utils/lopa';
import './AlertFeed.css';

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

  return (
    <div className="alert-feed">
      <div className="alert-feed-header">
        <span className="alert-feed-title">ALERT FEED</span>
        {alerts.filter(a => !a.acknowledged).length > 0 && (
          <span className="alert-count">{alerts.filter(a => !a.acknowledged).length}</span>
        )}
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
            <div className="alert-card-header">
              <span className={`alert-level-badge ${alert.level}`}>
                {alert.level === 'critical' ? '🚨' : alert.level === 'amber' ? '⚠️' : 'ℹ️'}
              </span>
              <span className="alert-card-title">{alert.title}</span>
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
