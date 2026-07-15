import { useEffect, useRef } from 'react';
import { useStore } from './store/useStore';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import EvidenceBundle from './components/EvidenceBundle';
import EdgeLighting from './components/EdgeLighting';
import { useAmbientSound } from './utils/ambientSound';
import './App.css';

function App() {
  const isPlaying = useStore(s => s.isPlaying);
  const tick = useStore(s => s.tick);
  const intervalRef = useRef<number | null>(null);

  useAmbientSound();

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        tick();
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, tick]);

  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <LeftPanel />
        <CenterPanel />
        <RightPanel />
      </div>
      <EvidenceBundle />
      <EdgeLighting />
    </div>
  );
}

export default App;
