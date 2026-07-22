import { useState, useMemo } from 'react';
import { CAUSAL_VARIABLES, CAUSAL_EDGES, IPL_LABELS } from '../data/causalGraph';
import type { SimulationVariables } from '../utils/causalEngine';
import CornerBrackets from './CornerBrackets';
import './CausalGraphPanel.css';

interface Props {
  variables: SimulationVariables;
  liveVariables: SimulationVariables;
  onChange: (id: keyof SimulationVariables, value: number) => void;
  recentlyChanged: string | null;
}

const LEVEL_Y: Record<number, number> = { 1: 60, 2: 230, 3: 400 };
const LEVEL_ROWS: Record<number, string[]> = {
  1: ['STAFFING_RATIO', 'MAINTENANCE_BUDGET', 'PTW_COMPLIANCE_RATE', 'SAFETY_CULTURE_INDEX'],
  2: ['SIS_PROOF_TEST_INTERVAL', 'GAS_DETECTOR_CALIBRATION', 'LADLE_INSPECTION_STATUS', 'ACTIVE_PERMIT_COUNT', 'EQUIPMENT_BYPASS_COUNT'],
  3: ['CO_GAS_READING', 'FLAMMABLE_GAS_READING', 'LADLE_PRESSURE', 'WORKERS_IN_ZONE', 'SIMOPS_CONFLICTS_ACTIVE'],
};
const NODE_W = 160;
const NODE_H = 66;

function computeNodePositions() {
  const positions: Record<string, { x: number; y: number }> = {};
  (Object.keys(LEVEL_ROWS) as unknown as number[]).forEach(levelKey => {
    const level = Number(levelKey);
    const ids = LEVEL_ROWS[level];
    const totalWidth = 880;
    const spacing = totalWidth / ids.length;
    ids.forEach((id, i) => {
      positions[id] = { x: 10 + spacing * i + spacing / 2 - NODE_W / 2, y: LEVEL_Y[level] };
    });
  });
  return positions;
}
const NODE_POS = computeNodePositions();

// Edges between two graph nodes (both sides are causal variables, not IPL outputs).
const VARIABLE_EDGES = CAUSAL_EDGES.filter(e => !e.to.startsWith('ipl'));
// Edges from a variable straight to an IPL score — shown as a chip on the node, not an arrow.
const IPL_EDGES = CAUSAL_EDGES.filter(e => e.to.startsWith('ipl'));

function iplChipFor(varId: string): string | null {
  const edges = IPL_EDGES.filter(e => e.from === varId);
  if (edges.length === 0) return null;
  if (edges.length > 1) return `→ all IPLs (${edges[0].strength})`;
  return `→ ${IPL_LABELS[edges[0].to]} (${edges[0].strength})`;
}

const STRENGTH_WIDTH: Record<string, number> = { strong: 3, medium: 2, weak: 1 };

export default function CausalGraphPanel({ variables, liveVariables, onChange, recentlyChanged }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingVar = useMemo(() => CAUSAL_VARIABLES.find(v => v.id === editingId), [editingId]);

  return (
    <div className="causal-graph-panel glass-panel">
      <CornerBrackets />
      <div className="cgp-header panel-header-bar">
        <span>
          <span className="panel-glyph">◈</span>
          <span className="cgp-title">CAUSAL GRAPH</span>
        </span>
        <span className="panel-header-right">
          <span className="cgp-subtitle">3-Level Hierarchy · changes propagate downward only</span>
          <span className="panel-live-dot" />
        </span>
      </div>

      <svg viewBox="0 0 900 470" className="cgp-svg">
        <defs>
          <marker id="cgp-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#2dd4bf" />
          </marker>
        </defs>

        {[1, 2, 3].map(level => (
          <text key={level} x={10} y={LEVEL_Y[level] - 18} className="cgp-level-label">
            LEVEL {level} — {level === 1 ? 'ORGANIZATIONAL' : level === 2 ? 'PROCESS / EQUIPMENT' : 'OPERATIONAL / REAL-TIME'}
          </text>
        ))}

        {/* Directed edges between variables */}
        {VARIABLE_EDGES.map((edge, i) => {
          const from = NODE_POS[edge.from];
          const to = NODE_POS[edge.to];
          if (!from || !to) return null;
          const x1 = from.x + NODE_W / 2;
          const y1 = from.y + NODE_H;
          const x2 = to.x + NODE_W / 2;
          const y2 = to.y;
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2 - 6}
              className={`cgp-edge ${recentlyChanged === edge.from ? 'cgp-edge-pulse' : ''}`}
              strokeWidth={STRENGTH_WIDTH[edge.strength]}
              markerEnd="url(#cgp-arrow)"
            />
          );
        })}

        {/* Nodes */}
        {CAUSAL_VARIABLES.map(v => {
          const pos = NODE_POS[v.id];
          const value = variables[v.id as keyof SimulationVariables];
          const liveValue = liveVariables[v.id as keyof SimulationVariables];
          const delta = value - liveValue;
          const deltaSafe = delta * v.saferDirection >= 0;
          const chip = iplChipFor(v.id);

          return (
            <g
              key={v.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="cgp-node"
              onClick={() => setEditingId(v.id)}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={7}
                className={`cgp-node-rect ${editingId === v.id ? 'cgp-node-active' : ''}`}
              />
              <text x={8} y={16} className="cgp-node-label">{v.label}</text>
              <text x={8} y={35} className="cgp-node-value">{v.format(value)}</text>
              {Math.abs(delta) > 1e-6 && (
                <text x={NODE_W - 8} y={35} textAnchor="end" className={`cgp-node-delta ${deltaSafe ? 'safe' : 'unsafe'}`}>
                  {delta > 0 ? '+' : ''}{v.format(delta)}
                </text>
              )}
              {chip && <text x={8} y={53} className="cgp-node-chip">{chip}</text>}
            </g>
          );
        })}
      </svg>

      {editingVar && (
        <div className="cgp-editor">
          <CornerBrackets size={7} />
          <div className="cgp-editor-header">
            <span>{editingVar.label}</span>
            <button className="cgp-editor-close" onClick={() => setEditingId(null)}>✕</button>
          </div>
          <div className="cgp-editor-value mono">{editingVar.format(variables[editingVar.id as keyof SimulationVariables])}</div>
          <input
            type="range"
            min={editingVar.min}
            max={editingVar.max}
            step={editingVar.step}
            value={variables[editingVar.id as keyof SimulationVariables]}
            onChange={e => onChange(editingVar.id as keyof SimulationVariables, Number(e.target.value))}
          />
          <div className="cgp-editor-range">
            <span>{editingVar.format(editingVar.min)}</span>
            <span>{editingVar.format(editingVar.max)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
