import { useStore } from '../store/useStore';
import { getEdgeState } from '../utils/lopa';
import './EdgeLighting.css';

export default function EdgeLighting() {
  const compoundRisk = useStore(s => s.compoundRisk);
  const state = getEdgeState(compoundRisk);

  return (
    <div className="edge-lighting" aria-hidden="true">
      <div className={`edge-strip edge-top edge-${state}`} />
      <div className={`edge-strip edge-bottom edge-${state}`} />
      <div className={`edge-strip edge-left edge-${state}`} />
      <div className={`edge-strip edge-right edge-${state}`} />
    </div>
  );
}
