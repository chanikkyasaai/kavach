import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useStore } from '../store/useStore';
import { sensors } from '../data/sensors';
import CornerBrackets from './CornerBrackets';
import './BottomStrip.css';

const MONITORED_SENSORS = ['S01', 'S07', 'S09'];
const AXIS_TICK_STYLE = { fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fill: '#4a5563' };

export default function BottomStrip() {
  const sensorReadings = useStore(s => s.sensorReadings);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`bottom-strip glass-panel ${collapsed ? 'panel-collapsed' : ''}`}>
      <button
        className="panel-minimize-btn"
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? 'Expand sensor charts' : 'Minimize sensor charts'}
      >
        {collapsed ? '▴' : '▾'}
      </button>
      {!collapsed && <div className="strip-charts">
        {MONITORED_SENSORS.map((sensorId, idx) => {
          const sensor = sensors.find(s => s.id === sensorId)!;
          const reading = sensorReadings[sensorId];
          if (!reading) return null;

          const data = reading.history.map((val, i) => ({ t: i, v: val }));
          const currentValue = reading.value;
          const pct = currentValue / sensor.threshold;
          const aboveThreshold = pct >= 1;
          const color = aboveThreshold ? '#ff4d4d' : pct >= 0.8 ? '#ffb238' : '#00b4ff';
          const gradId = `sensor-fill-${idx}`;

          return (
            <div key={sensorId} className="sensor-chart">
              <CornerBrackets size={8} thickness={1} />
              <div className="sensor-chart-header">
                <span className="sensor-chart-name">{sensor.name}</span>
                <span className="sensor-chart-value mono" style={{ color }}>
                  {currentValue.toFixed(1)} <small>{sensor.unit}</small>
                </span>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 2, left: 0 }}>
                    <defs>
                      <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={aboveThreshold ? 0.3 : 0.25} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" hide />
                    <YAxis
                      hide={false}
                      domain={[0, sensor.criticalThreshold * 1.1]}
                      tickCount={3}
                      tick={AXIS_TICK_STYLE}
                      axisLine={false}
                      tickLine={false}
                      width={26}
                    />
                    <ReferenceLine
                      y={sensor.threshold}
                      stroke="#ffb238"
                      strokeDasharray="2 2"
                      strokeWidth={0.75}
                    />
                    <ReferenceLine
                      y={sensor.criticalThreshold}
                      stroke="#ff4d4d"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      label={{ value: sensor.criticalThreshold, position: 'insideTopRight', fontSize: 8, fill: '#ff4d4d' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={color}
                      strokeWidth={2}
                      fill={`url(#${gradId})`}
                      dot={false}
                      animationDuration={0}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
