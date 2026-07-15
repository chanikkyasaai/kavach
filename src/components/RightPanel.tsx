import AlertFeed from './AlertFeed';
import Copilot from './Copilot';
import './RightPanel.css';

export default function RightPanel() {
  return (
    <div className="right-panel">
      <div className="right-panel-alerts">
        <AlertFeed />
      </div>
      <div className="right-panel-copilot">
        <Copilot />
      </div>
    </div>
  );
}
