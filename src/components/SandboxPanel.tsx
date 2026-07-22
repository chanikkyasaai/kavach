import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore } from '../store/useStore';
import { useSimulationStore } from '../store/simulationStore';
import { simulationPresets } from '../data/simulationPresets';
import { getLiveDefaultVariables } from '../utils/causalEngine';
import PlantScene from './three/PlantScene';
import BowTie from './BowTie';
import CausalGraphPanel from './CausalGraphPanel';
import SimulationResultsPanel from './SimulationResultsPanel';
import './SandboxPanel.css';

const SIM_CAMERA_PROPS = { position: [13, 30, 36] as [number, number, number], fov: 42, near: 0.5, far: 300 };

function SandboxCanvas({ storeType, label }: { storeType: 'live' | 'simulation'; label: string }) {
  return (
    <div className="sandbox-canvas-wrap">
      <span className="sandbox-canvas-label">{label}</span>
      <Canvas camera={SIM_CAMERA_PROPS} gl={{ antialias: true, alpha: false, toneMappingExposure: 1.35 }} style={{ background: '#0c2b25' }}>
        <ambientLight intensity={0.8} color="#c3ece3" />
        <directionalLight position={[18, 42, 16]} intensity={1.7} color="#e6fffa" castShadow />
        <directionalLight position={[-14, 20, -10]} intensity={0.5} color="#5eead4" />
        <directionalLight position={[-8, 14, 22]} intensity={0.5} color="#7ee0ff" />
        <pointLight position={[2, 8, -1]} intensity={5.5} color="#ff6600" distance={18} decay={2} />
        <pointLight position={[-9, 3, -1]} intensity={1.8} color="#2dd4bf" distance={12} decay={2} />
        <hemisphereLight args={['#2dd4bf', '#0a2b24', 0.5]} />
        <fog attach="fog" args={['#0c2b25', 30, 100]} />
        <PlantScene storeType={storeType} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={0.3}
          maxPolarAngle={Math.PI / 2.3}
          minDistance={12}
          maxDistance={80}
          autoRotate
          autoRotateSpeed={0.12}
          target={[0, 2, 1]}
        />
      </Canvas>
    </div>
  );
}

export default function SandboxPanel() {
  const liveIpls = useStore(s => s.ipls);
  const liveCompoundRisk = useStore(s => s.compoundRisk);
  const liveSensorReadings = useStore(s => s.sensorReadings);
  const liveSimopsConflicts = useStore(s => s.simopsConflicts);
  const liveWorkers = useStore(s => s.workers);

  const {
    variables, iplScores, compoundRisk, activePresetId,
    isRunningForward, runForwardTime,
    initFromLive, setVariable, loadPreset,
    startRunForward, pauseRunForward, resetRunForward, tickRunForward, pushToLive,
  } = useSimulationStore();

  const [showBowTie, setShowBowTie] = useState(false);
  const [splitScreen, setSplitScreen] = useState(false);
  const [recentlyChanged, setRecentlyChanged] = useState<string | null>(null);
  const pulseTimeout = useRef<number | null>(null);

  useEffect(() => {
    initFromLive();
  }, [initFromLive]);

  useEffect(() => {
    if (!isRunningForward) return;
    const interval = window.setInterval(() => tickRunForward(), 500);
    return () => window.clearInterval(interval);
  }, [isRunningForward, tickRunForward]);

  const liveVariables = useMemo(
    () => getLiveDefaultVariables(liveIpls, liveSensorReadings, liveSimopsConflicts.length, liveWorkers.filter(w => w.zone === 'Z1').length),
    [liveIpls, liveSensorReadings, liveSimopsConflicts, liveWorkers]
  );

  const simIpls = useMemo(
    () => liveIpls.map(ipl => ({ ...ipl, score: iplScores[ipl.id] ?? ipl.score })),
    [liveIpls, iplScores]
  );

  const handleChange = (id: keyof typeof variables, value: number) => {
    setVariable(id, value);
    setRecentlyChanged(id);
    if (pulseTimeout.current) window.clearTimeout(pulseTimeout.current);
    pulseTimeout.current = window.setTimeout(() => setRecentlyChanged(null), 700);
  };

  return (
    <div className="sandbox-panel simulation-mode glass-panel">
      <div className="sandbox-banner">
        <span>⬡ SIMULATION MODE — No changes affect live system</span>
      </div>

      <div className="sandbox-presets">
        {simulationPresets.map(preset => (
          <button
            key={preset.id}
            className={`sandbox-preset-btn ${activePresetId === preset.id ? 'active' : ''}`}
            onClick={() => loadPreset(preset.id)}
            title={preset.description}
          >
            {preset.label}
          </button>
        ))}
        <div className="sandbox-view-toggles">
          <button className={`sandbox-toggle-btn ${showBowTie ? 'active' : ''}`} onClick={() => setShowBowTie(v => !v)}>
            BOW-TIE OVERLAY
          </button>
          <button className={`sandbox-toggle-btn ${splitScreen ? 'active' : ''}`} onClick={() => setSplitScreen(v => !v)}>
            ⇔ SPLIT VIEW
          </button>
        </div>
      </div>

      <div className="sandbox-body">
        <div className="sandbox-column sandbox-column-graph">
          <CausalGraphPanel
            variables={variables}
            liveVariables={liveVariables}
            onChange={handleChange}
            recentlyChanged={recentlyChanged}
          />
        </div>

        <div className="sandbox-column sandbox-column-3d">
          {splitScreen ? (
            <div className="sandbox-split">
              <SandboxCanvas storeType="live" label="LIVE" />
              <div className="sandbox-split-divider" />
              <SandboxCanvas storeType="simulation" label="SIMULATED" />
            </div>
          ) : (
            <SandboxCanvas storeType="simulation" label="SIMULATED PLANT STATE" />
          )}
          {showBowTie && (
            <div className="sandbox-bowtie-overlay">
              <BowTie ipls={simIpls} compoundRisk={compoundRisk} />
            </div>
          )}
        </div>

        <div className="sandbox-column sandbox-column-results">
          <SimulationResultsPanel
            liveIpls={liveIpls}
            liveCompoundRisk={liveCompoundRisk}
            simIplScores={iplScores}
            simCompoundRisk={compoundRisk}
            variables={variables}
            isRunningForward={isRunningForward}
            runForwardTime={runForwardTime}
            onStartRunForward={startRunForward}
            onPauseRunForward={pauseRunForward}
            onResetRunForward={resetRunForward}
            onPushToLive={pushToLive}
          />
        </div>
      </div>
    </div>
  );
}
