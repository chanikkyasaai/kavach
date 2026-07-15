import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore } from '../store/useStore';
import PlantScene from './three/PlantScene';
import BottomStrip from './BottomStrip';
import SafetyLoopPanel from './SafetyLoopPanel';
import './CenterPanel.css';

export default function CenterPanel() {
  const centerTab = useStore(s => s.centerTab);
  const setCenterTab = useStore(s => s.setCenterTab);
  const compoundRisk = useStore(s => s.compoundRisk);
  const showSafetyLoopBadge = compoundRisk >= 60 && centerTab !== 'safety-loop';

  return (
    <div className="center-panel">
      <div className="center-tabs">
        <button
          className={`center-tab-btn ${centerTab === '3d' ? 'active' : ''}`}
          onClick={() => setCenterTab('3d')}
        >
          3D PLANT VIEW
        </button>
        <button
          className={`center-tab-btn ${centerTab === 'safety-loop' ? 'active' : ''}`}
          onClick={() => setCenterTab('safety-loop')}
        >
          SAFETY LOOP
          {showSafetyLoopBadge && <span className="center-tab-badge" />}
        </button>
      </div>
      <div className="viewport-3d" style={{ display: centerTab === '3d' ? 'block' : 'none' }}>
        <div className="viewport-label">
          <span>3D PLANT INTELLIGENCE VIEW</span>
          <span className="viewport-hint">Orbit • Zoom • Pan</span>
        </div>
        <div className="viewport-legend">
          <span className="legend-item"><span className="dot permanent"></span>Permanent</span>
          <span className="legend-item"><span className="dot contract"></span>Contract</span>
          <span className="legend-item"><span className="dot sensor-ok"></span>Sensor OK</span>
          <span className="legend-item"><span className="dot sensor-warn"></span>Warning</span>
          <span className="legend-item"><span className="dot sensor-alarm"></span>Alarm</span>
        </div>
        <Canvas
          camera={{ position: [12, 9, 12], fov: 42, near: 0.1, far: 100 }}
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          style={{ background: '#0f1b2d' }}
        >
          <Suspense fallback={null}>
            {/* Strong ambient so nothing is black */}
            <ambientLight intensity={0.6} color="#b8c8e0" />

            {/* Main sun light — high intensity */}
            <directionalLight
              position={[10, 20, 8]}
              intensity={1.2}
              color="#ffffff"
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-far={50}
              shadow-camera-left={-15}
              shadow-camera-right={15}
              shadow-camera-top={15}
              shadow-camera-bottom={-15}
            />

            {/* Fill light from opposite side */}
            <directionalLight
              position={[-8, 10, -6]}
              intensity={0.4}
              color="#a0c0ff"
            />

            {/* Warm furnace glow */}
            <pointLight position={[-2, 2, -2]} intensity={3} color="#ff6600" distance={8} decay={2} />

            {/* Cool accent */}
            <pointLight position={[2, 3, 3]} intensity={1} color="#06b6d4" distance={8} decay={2} />

            {/* Hemisphere light for even fill */}
            <hemisphereLight args={['#4488cc', '#1a2244', 0.4]} />

            {/* Fog for depth (navy tinted) */}
            <fog attach="fog" args={['#0f1b2d', 20, 45]} />

            <PlantScene />

            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              minPolarAngle={0.3}
              maxPolarAngle={Math.PI / 2.3}
              minDistance={5}
              maxDistance={22}
              autoRotate
              autoRotateSpeed={0.2}
              target={[0, 0.5, 0]}
            />
          </Suspense>
        </Canvas>
      </div>
      <div style={{ display: centerTab === 'safety-loop' ? 'flex' : 'none', flex: 1, minHeight: 0 }}>
        <SafetyLoopPanel />
      </div>
      <BottomStrip />
    </div>
  );
}
