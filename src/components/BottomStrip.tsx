import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useStore } from '../store/useStore';
import { sensors } from '../data/sensors';
import './BottomStrip.css';

const MONITORED_SENSORS = ['S01', 'S07', 'S09'];

export default function BottomStrip() {
  const sensorReadings = useStore(s => s.sensorReadings);

  return (
    <div className="bottom-strip">
      <div className="strip-charts">
        {MONITORED_SENSORS.map(sensorId => {
          const sensor = sensors.find(s => s.id === sensorId)!;
          const reading = sensorReadings[sensorId];
          if (!reading) return null;

          const data = reading.history.map((val, i) => ({ t: i, v: val }));
          const currentValue = reading.value;
          const pct = currentValue / sensor.threshold;
          const color = pct >= 1 ? '#ef4444' : pct >= 0.8 ? '#f59e0b' : '#10b981';

          return (
            <div key={sensorId} className="sensor-chart">
              <div className="sensor-chart-header">
                <span className="sensor-chart-name">{sensor.name}</span>
                <span className="sensor-chart-value mono" style={{ color }}>
                  {currentValue.toFixed(1)} <small>{sensor.unit}</small>
                </span>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 2, right: 4, bottom: 2, left: 4 }}>
                    <XAxis dataKey="t" hide />
                    <YAxis hide domain={[0, sensor.criticalThreshold * 1.1]} />
                    <ReferenceLine
                      y={sensor.threshold}
                      stroke="#f59e0b"
                      strokeDasharray="2 2"
                      strokeWidth={0.5}
                    />
                    <ReferenceLine
                      y={sensor.criticalThreshold}
                      stroke="#ef4444"
                      strokeDasharray="2 2"
                      strokeWidth={0.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={color}
                      strokeWidth={1.5}
                      dot={false}
                      animationDuration={0}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
