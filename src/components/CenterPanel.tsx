import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore } from '../store/useStore';
import PlantScene from './three/PlantScene';
import BottomStrip from './BottomStrip';
import SafetyLoopPanel from './SafetyLoopPanel';
import SandboxPanel from './SandboxPanel';
import CameraPanel from './CameraPanel';
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
        <button
          className={`center-tab-btn sandbox-tab-btn ${centerTab === 'sandbox' ? 'active' : ''}`}
          onClick={() => setCenterTab('sandbox')}
        >
          SIMULATION SANDBOX
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
        <CameraPanel />
        <Canvas
          camera={{ position: [8, 19, 22], fov: 42, near: 0.5, far: 300 }}
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMappingExposure: 1.35 }}
          style={{ background: '#050508' }}
        >
          <Suspense fallback={null}>
            {/* Strong ambient so nothing is black */}
            <ambientLight intensity={0.85} color="#c3d3ea" />

            {/* Main sun (key) light — high intensity, raised for the taller blast furnace */}
            <directionalLight
              position={[18, 42, 16]}
              intensity={1.9}
              color="#fff4e0"
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-far={130}
              shadow-camera-left={-26}
              shadow-camera-right={26}
              shadow-camera-top={22}
              shadow-camera-bottom={-18}
            />

            {/* Fill light from opposite side */}
            <directionalLight
              position={[-14, 20, -10]}
              intensity={0.55}
              color="#a0c0ff"
            />

            {/* Rim/backlight — separates structures from the dark background */}
            <directionalLight
              position={[-8, 14, 22]}
              intensity={0.6}
              color="#7ee0ff"
            />

            {/* Warm furnace glow near Blast Furnace / SMS */}
            <pointLight position={[2, 8, -1]} intensity={6} color="#ff6600" distance={18} decay={2} />

            {/* Cool accent near Coke Ovens */}
            <pointLight position={[-9, 3, -1]} intensity={1.8} color="#06b6d4" distance={12} decay={2} />

            {/* Hemisphere light for even fill */}
            <hemisphereLight args={['#5a9bd4', '#1a2244', 0.55]} />

            {/* Exponential fog — distant structures (rolling mills) fade into
                atmospheric haze instead of reading as "placed in space". */}
            <fogExp2 attach="fog" args={['#060810', 0.018]} />

            <PlantScene storeType="live" />

            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              minPolarAngle={0.3}
              maxPolarAngle={Math.PI / 2.3}
              minDistance={9}
              maxDistance={60}
              autoRotate
              autoRotateSpeed={0.12}
              target={[0, 2, 1]}
            />
          </Suspense>
        </Canvas>
      </div>
      <div style={{ display: centerTab === 'safety-loop' ? 'contents' : 'none' }}>
        <SafetyLoopPanel />
      </div>
      {centerTab === 'sandbox' && <SandboxPanel />}
      <BottomStrip />
    </div>
  );
}
