import { useState } from 'react';
import './RadialGauge.css';

interface Props {
  score: number;
  size?: number;
}

const SWEEP_DEGREES = 270;
const START_ANGLE = 135;

// Local to this gauge only — does not touch getIPLColor/lopa.ts. Matches the
// three-tier thresholds specified for this dial treatment.
function arcColor(score: number): string {
  if (score > 75) return '#3ecf8e';
  if (score >= 50) return '#ffb238';
  return '#ff4d4d';
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/** 270° radial arc gauge with 10-point tick marks and a trailing sparkline.
 *  Score history is tracked locally (component-scoped, not store-scoped) —
 *  purely presentational, doesn't touch any logic/store file. */
export default function RadialGauge({ score, size = 76 }: Props) {
  const color = arcColor(score);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 9;
  const endAngle = START_ANGLE + SWEEP_DEGREES;
  const valueAngle = START_ANGLE + (Math.max(0, Math.min(100, score)) / 100) * SWEEP_DEGREES;
  const ticks = Array.from({ length: 9 }, (_, i) => START_ANGLE + ((i + 1) / 10) * SWEEP_DEGREES);

  // Adjusting state during render in response to a prop change — the
  // React-sanctioned alternative to tracking this in a ref + effect.
  const [history, setHistory] = useState<number[]>([score]);
  if (history[history.length - 1] !== score) {
    setHistory([...history, score].slice(-10));
  }

  const sparkW = 24;
  const sparkH = 12;
  const sparkPoints = history
    .map((v, i) => {
      const x = history.length > 1 ? (i / (history.length - 1)) * sparkW : sparkW;
      const y = sparkH - (Math.max(0, Math.min(100, v)) / 100) * sparkH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="radial-gauge">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={arcPath(cx, cy, r, START_ANGLE, endAngle)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        {ticks.map((angle, i) => {
          const inner = polarToCartesian(cx, cy, r - 4, angle);
          const outer = polarToCartesian(cx, cy, r + 4, angle);
          return (
            <line
              key={i}
              x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={1}
            />
          );
        })}
        <path
          d={arcPath(cx, cy, r, START_ANGLE, valueAngle)}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          className="radial-gauge-fill"
          style={{ stroke: color, filter: `drop-shadow(0 0 3px ${color})` }}
        />
        <text
          x={cx} y={cy + 7}
          textAnchor="middle"
          fontSize={size >= 76 ? 22 : 16}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight={700}
          fill={color}
        >
          {Math.round(score)}
        </text>
      </svg>
      <svg className="radial-gauge-spark" width={sparkW} height={sparkH} viewBox={`0 0 ${sparkW} ${sparkH}`}>
        <polyline points={sparkPoints} fill="none" stroke={color} strokeWidth={1} opacity={0.85} />
      </svg>
    </div>
  );
}
