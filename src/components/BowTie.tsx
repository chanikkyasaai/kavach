import type { IPLState } from '../store/useStore';
import { getIPLColor } from '../utils/lopa';
import { bowTieThreats, bowTieConsequences } from '../data/interventions';
import './BowTie.css';

interface BowTieProps {
  ipls: IPLState[];
  compoundRisk: number;
}

const THREAT_X = 10;
const THREAT_W = 170;
const THREAT_H = 68;
const THREAT_YS = [30, 240, 450];

const BANK_X = 250;
const BANK_W = 140;
const BAR_H = 100;
const BAR_GAP = 12;
const BANK_Y0 = 28;

const TOP_EVENT_CX = 520;
const TOP_EVENT_CY = 300;
const TOP_EVENT_R = 83;

const CONS_X = 650;
const CONS_W = 240;
const CONS_H = 68;
const CONS_YS = [30, 240, 450];

function barrierWidth(score: number): number {
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const MIN_W = 20;
  return MIN_W + pct * (BANK_W - MIN_W);
}

function wrapWords(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default function BowTie({ ipls, compoundRisk }: BowTieProps) {
  const barY = (i: number) => BANK_Y0 + i * (BAR_H + BAR_GAP);
  const isCritical = compoundRisk > 70;

  return (
    <div className="bowtie">
      <div className="bowtie-header panel-header-bar">
        <span>
          <span className="panel-glyph">◈</span>
          <span className="bowtie-title">LIVE BOW-TIE THREAT PATHWAY</span>
        </span>
        <span className="panel-header-right">
          <span className="bowtie-subtitle">LOPA / IOGP Bow-Tie · SG-26</span>
          <span className="panel-live-dot" />
        </span>
      </div>
      <svg viewBox="0 0 900 600" className="bowtie-svg" preserveAspectRatio="xMidYMid meet">
        {/* Threat → barrier-bank connectors */}
        {THREAT_YS.map((y, i) => (
          <line
            key={`t-line-${i}`}
            x1={THREAT_X + THREAT_W}
            y1={y + THREAT_H / 2}
            x2={BANK_X}
            y2={TOP_EVENT_CY}
            className="bowtie-connector"
          />
        ))}

        {/* Threat nodes */}
        {bowTieThreats.map((threat, i) => (
          <g key={threat.id}>
            <rect
              x={THREAT_X}
              y={THREAT_YS[i]}
              width={THREAT_W}
              height={THREAT_H}
              rx={6}
              className="bowtie-node bowtie-threat"
            />
            {wrapWords(threat.label, 20).map((line, li) => (
              <text
                key={li}
                x={THREAT_X + THREAT_W / 2}
                y={THREAT_YS[i] + THREAT_H / 2 - 4 + li * 13}
                textAnchor="middle"
                className="bowtie-node-label"
              >
                {line}
              </text>
            ))}
          </g>
        ))}

        {/* Barrier bank → top event connectors */}
        {ipls.map((_, i) => (
          <line
            key={`b-line-${i}`}
            x1={BANK_X + BANK_W}
            y1={barY(i) + BAR_H / 2}
            x2={TOP_EVENT_CX - TOP_EVENT_R}
            y2={TOP_EVENT_CY}
            className="bowtie-connector"
          />
        ))}

        {/* Barrier bank */}
        {ipls.map((ipl, i) => {
          const color = getIPLColor(ipl.score);
          const degraded = ipl.score < 80;
          return (
            <g key={ipl.id}>
              <rect
                x={BANK_X}
                y={barY(i)}
                width={BANK_W}
                height={BAR_H}
                rx={4}
                className="bowtie-barrier-slot"
              />
              <rect
                x={BANK_X}
                y={barY(i)}
                width={barrierWidth(ipl.score)}
                height={BAR_H}
                rx={4}
                className="bowtie-barrier-fill"
                fill={color}
              />
              <text x={BANK_X + 8} y={barY(i) + 18} className="bowtie-barrier-label">
                IPL-{i + 1} {ipl.shortName}
              </text>
              <text x={BANK_X + BANK_W - 8} y={barY(i) + 18} textAnchor="end" className="bowtie-barrier-score" fill={color}>
                {ipl.score}
              </text>
              {degraded && (
                <text x={BANK_X + 8} y={barY(i) + 34} className="bowtie-escalation-label">
                  {wrapWords(ipl.factors.split('.')[0], 22).slice(0, 3).map((line, li) => (
                    <tspan key={li} x={BANK_X + 8} dy={li === 0 ? 0 : 10}>{line}</tspan>
                  ))}
                </text>
              )}
            </g>
          );
        })}

        {/* Top event → consequence connectors */}
        {CONS_YS.map((y, i) => (
          <line
            key={`c-line-${i}`}
            x1={TOP_EVENT_CX + TOP_EVENT_R}
            y1={TOP_EVENT_CY}
            x2={CONS_X}
            y2={y + CONS_H / 2}
            className="bowtie-connector"
          />
        ))}

        {/* Top event */}
        <circle
          cx={TOP_EVENT_CX}
          cy={TOP_EVENT_CY}
          r={TOP_EVENT_R}
          className={`bowtie-top-event ${isCritical ? 'bowtie-top-event-critical' : ''}`}
        />
        <text x={TOP_EVENT_CX} y={TOP_EVENT_CY - 12} textAnchor="middle" className="bowtie-top-event-label">
          <tspan x={TOP_EVENT_CX} dy={0}>UNCONTROLLED</tspan>
          <tspan x={TOP_EVENT_CX} dy={13}>IGNITION /</tspan>
          <tspan x={TOP_EVENT_CX} dy={13}>LADLE EXPLOSION</tspan>
        </text>
        <text x={TOP_EVENT_CX} y={TOP_EVENT_CY + 34} textAnchor="middle" className="bowtie-top-event-risk">
          {compoundRisk}
        </text>

        {/* Consequence nodes */}
        {bowTieConsequences.map((label, i) => (
          <g key={label}>
            <rect
              x={CONS_X}
              y={CONS_YS[i]}
              width={CONS_W}
              height={CONS_H}
              rx={6}
              className="bowtie-node bowtie-consequence"
            />
            {wrapWords(label, 26).map((line, li) => (
              <text
                key={li}
                x={CONS_X + CONS_W / 2}
                y={CONS_YS[i] + CONS_H / 2 - 4 + li * 13}
                textAnchor="middle"
                className="bowtie-node-label"
              >
                {line}
              </text>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
