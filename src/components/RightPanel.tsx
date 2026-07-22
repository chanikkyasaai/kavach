import { useState } from 'react';
import AlertFeed from './AlertFeed';
import Copilot from './Copilot';
import './RightPanel.css';

export default function RightPanel() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`right-panel ${collapsed ? 'panel-collapsed' : ''}`}>
      <button
        className="panel-minimize-btn"
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? 'Expand alerts + copilot' : 'Minimize alerts + copilot'}
      >
        {collapsed ? '‹' : '›'}
      </button>
      {!collapsed && (
        <>
          <div className="right-panel-alerts">
            <AlertFeed />
          </div>
          <div className="right-panel-copilot">
            <Copilot />
          </div>
        </>
      )}
    </div>
  );
}
