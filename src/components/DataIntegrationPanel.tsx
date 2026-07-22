import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { equipment } from '../data/equipment';
import CornerBrackets from './CornerBrackets';
import './DataIntegrationPanel.css';

interface Props {
  onClose: () => void;
}

type LayerId = 'process' | 'permits' | 'workforce' | 'equipment';

interface LayerDef {
  id: LayerId;
  ipl: string;
  title: string;
  cx: number;
  cy: number;
  feeds: string;
  minSource: string;
  fullSource: string;
  protocols: string;
}

const LAYERS: LayerDef[] = [
  {
    id: 'process', ipl: 'IPL-1 · BPCS', title: 'PROCESS SIGNALS', cx: 190, cy: 130,
    feeds: 'Gas, pressure, temperature, flow',
    minSource: 'Manual field entry every 30 min',
    fullSource: 'OPC-UA historian subscription (read-only)',
    protocols: 'OPC-UA 4840 · MQTT · Modbus TCP',
  },
  {
    id: 'permits', ipl: 'IPL-3 · PTW', title: 'WORK PERMITS', cx: 710, cy: 130,
    feeds: 'Active PTWs, PHSA, SIMOPS conflicts',
    minSource: 'Photograph paper PTW → Claude Vision OCR',
    fullSource: 'ePTW REST API · direct DB connector',
    protocols: 'OISD-STD-105 rule engine — all sources',
  },
  {
    id: 'equipment', ipl: 'IPL-4 · MECH', title: 'EQUIPMENT HEALTH', cx: 190, cy: 430,
    feeds: 'Inspections, work orders, bypasses',
    minSource: 'Manual entry by maintenance super',
    fullSource: 'SAP PM · IBM Maximo · any CMMS REST API',
    protocols: 'CMMS webhook · nightly batch sync',
  },
  {
    id: 'workforce', ipl: 'IPL-5 · HF', title: 'WORKFORCE PRESENCE', cx: 710, cy: 430,
    feeds: 'Headcount, identity, training status',
    minSource: 'QR code at zone gate + smartphone',
    fullSource: 'RFID/NFC readers · multi-camera CV',
    protocols: 'This demo: browser webcam + jsQR',
  },
];

const HUB = { cx: 450, cy: 280, r: 66 };

const ROADMAP = [
  { phase: 'PHASE 1', window: '72 hours', label: 'Any plant', detail: 'Manual entry + QR check-in + CSV export' },
  { phase: 'PHASE 2', window: '30 days', label: 'Level 2 plant', detail: 'OPC-UA + ePTW API + CMMS + RFID' },
  { phase: 'PHASE 3', window: '90 days', label: 'Level 3 plant', detail: 'Full IIoT + multi-camera CV + digital twin' },
];

function LayerIcon({ id }: { id: LayerId }) {
  if (id === 'process') {
    return <path d="M0,10 L6,10 L9,1 L13,19 L16,10 L22,10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />;
  }
  if (id === 'permits') {
    return (
      <g stroke="currentColor" strokeWidth="1.6" fill="none">
        <rect x="2" y="0" width="16" height="20" rx="1.5" />
        <line x1="5.5" y1="6" x2="14.5" y2="6" />
        <line x1="5.5" y1="10" x2="14.5" y2="10" />
        <line x1="5.5" y1="14" x2="11" y2="14" />
      </g>
    );
  }
  if (id === 'equipment') {
    return (
      <g fill="currentColor">
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <rect key={i} x={10 + Math.cos(a) * 9 - 1.6} y={10 + Math.sin(a) * 9 - 1.6} width="3.2" height="3.2" transform={`rotate(${(a * 180) / Math.PI} ${10 + Math.cos(a) * 9} ${10 + Math.sin(a) * 9})`} />;
        })}
        <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="10" cy="10" r="2.2" fill="currentColor" />
      </g>
    );
  }
  return (
    <g stroke="currentColor" strokeWidth="1.6" fill="none">
      <circle cx="10" cy="5.5" r="4" />
      <path d="M2,20 C2,13 6,10.5 10,10.5 C14,10.5 18,13 18,20" />
    </g>
  );
}

export default function DataIntegrationPanel({ onClose }: Props) {
  const [selected, setSelected] = useState<LayerId | null>(null);
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);

  const compoundRisk = useStore(s => s.compoundRisk);
  const sensorReadings = useStore(s => s.sensorReadings);
  const permits = useStore(s => s.permits);
  const simopsConflicts = useStore(s => s.simopsConflicts);
  const cameraActive = useStore(s => s.cameraActive);
  const cameraWorkerCount = useStore(s => s.cameraWorkerCount);
  const identifiedWorkers = useStore(s => s.identifiedWorkers);
  const workers = useStore(s => s.workers);

  const overdueEquipment = useMemo(
    () => equipment.filter(e => new Date(e.nextInspection) < new Date('2026-06-08')).length,
    []
  );

  const metricFor = (id: LayerId): { value: string; live: boolean } => {
    if (id === 'process') {
      const co = sensorReadings['S01'];
      return { value: co ? `${co.value.toFixed(1)} ppm CO` : '—', live: false };
    }
    if (id === 'permits') {
      return { value: simopsConflicts.length > 0 ? `${simopsConflicts.length} SIMOPS conflict` : `${permits.length} active permits`, live: false };
    }
    if (id === 'equipment') {
      return { value: `${overdueEquipment} inspection${overdueEquipment === 1 ? '' : 's'} overdue`, live: false };
    }
    // workforce
    if (cameraActive) return { value: `${cameraWorkerCount} detected · ${identifiedWorkers.length} ID'd`, live: true };
    return { value: `${workers.filter(w => w.zone === 'Z1').length} staffed (sim)`, live: false };
  };

  const selectedLayer = LAYERS.find(l => l.id === selected) ?? null;
  const selectedMetric = selectedLayer ? metricFor(selectedLayer.id) : null;

  return (
    <div className="dip-overlay" onClick={onClose}>
      <div className="dip-modal" onClick={e => e.stopPropagation()}>
        <CornerBrackets size={12} />
        <div className="dip-header">
          <div>
            <h2 className="dip-title">KAVACH DATA INTEGRATION ARCHITECTURE</h2>
            <p className="dip-subtitle">Four input layers feed the LOPA compound risk engine — connect what you have.</p>
          </div>
          <button className="dip-close" onClick={onClose}>✕</button>
        </div>

        <svg viewBox="0 0 900 560" className="dip-svg">
          <defs>
            <radialGradient id="dip-hub-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Flow conduits */}
          {LAYERS.map(l => {
            const live = metricFor(l.id).live;
            return (
              <line
                key={l.id}
                x1={l.cx} y1={l.cy} x2={HUB.cx} y2={HUB.cy}
                className={`dip-conduit ${live ? 'dip-conduit-live' : ''} ${selected === l.id ? 'dip-conduit-selected' : ''}`}
              />
            );
          })}

          {/* Hub */}
          <circle cx={HUB.cx} cy={HUB.cy} r={HUB.r + 30} fill="url(#dip-hub-glow)" />
          <circle cx={HUB.cx} cy={HUB.cy} r={HUB.r} className="dip-hub-circle" />
          <text x={HUB.cx} y={HUB.cy - 10} textAnchor="middle" className="dip-hub-label">LOPA</text>
          <text x={HUB.cx} y={HUB.cy + 10} textAnchor="middle" className="dip-hub-label">ENGINE</text>
          <text x={HUB.cx} y={HUB.cy + 34} textAnchor="middle" className="dip-hub-risk">{compoundRisk}</text>

          {/* Layer nodes */}
          {LAYERS.map(l => {
            const metric = metricFor(l.id);
            return (
              <g
                key={l.id}
                transform={`translate(${l.cx - 110}, ${l.cy - 58})`}
                className={`dip-node ${selected === l.id ? 'dip-node-selected' : ''}`}
                onClick={() => setSelected(selected === l.id ? null : l.id)}
              >
                <rect width={220} height={116} rx={12} className="dip-node-rect" />
                <g transform="translate(14, 14)" className="dip-node-icon">
                  <LayerIcon id={l.id} />
                </g>
                <text x={44} y={22} className="dip-node-title">{l.title}</text>
                <text x={44} y={36} className="dip-node-ipl">{l.ipl}</text>
                <circle cx={20} cy={54} r={4} className={`dip-status-dot ${metric.live ? 'live' : ''}`} />
                <text x={30} y={58} className={`dip-status-text ${metric.live ? 'live' : ''}`}>{metric.live ? 'CAMERA LIVE' : 'SIMULATION'}</text>
                <text x={14} y={90} className="dip-node-metric">{metric.value}</text>
                <text x={14} y={106} className="dip-node-hint">tap for detail →</text>
              </g>
            );
          })}
        </svg>

        {selectedLayer && selectedMetric && (
          <div className="dip-drawer">
            <div className="dip-drawer-head">
              <span>{selectedLayer.title}</span>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="dip-drawer-grid">
              <div><span className="dip-drawer-k">Feeds</span><span className="dip-drawer-v">{selectedLayer.feeds}</span></div>
              <div><span className="dip-drawer-k">Minimum viable</span><span className="dip-drawer-v">{selectedLayer.minSource}</span></div>
              <div><span className="dip-drawer-k">Full deployment</span><span className="dip-drawer-v">{selectedLayer.fullSource}</span></div>
              <div><span className="dip-drawer-k">Protocol</span><span className="dip-drawer-v">{selectedLayer.protocols}</span></div>
            </div>
          </div>
        )}

        <div className="dip-roadmap">
          <span className="dip-roadmap-label">DEPLOYMENT READINESS</span>
          <div className="dip-roadmap-track">
            {ROADMAP.map((p, i) => (
              <div
                key={p.phase}
                className="dip-roadmap-stop"
                onMouseEnter={() => setHoveredPhase(i)}
                onMouseLeave={() => setHoveredPhase(null)}
              >
                <div className="dip-roadmap-dot">{i + 1}</div>
                <span className="dip-roadmap-phase">{p.label}</span>
                <span className="dip-roadmap-window">{p.window}</span>
                {hoveredPhase === i && <div className="dip-roadmap-tooltip">{p.detail}</div>}
              </div>
            ))}
          </div>
          <span className="dip-roadmap-footnote">The compound risk formula runs identically on manual data and live sensor streams.</span>
        </div>
      </div>
    </div>
  );
}
