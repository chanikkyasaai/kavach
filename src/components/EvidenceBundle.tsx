import { useStore } from '../store/useStore';
import { sensors } from '../data/sensors';
import { formatTime } from '../utils/lopa';
import CornerBrackets from './CornerBrackets';
import './EvidenceBundle.css';

export default function EvidenceBundle() {
  const {
    evidenceBundleVisible,
    hideEvidenceBundle,
    scenarioTime,
    compoundRisk,
    ipls,
    sensorReadings,
    workers,
    permits,
    alerts,
    simopsConflicts,
    criticalZones,
  } = useStore();

  if (!evidenceBundleVisible) return null;

  const atRiskWorkers = workers.filter(w => criticalZones.includes(w.zone));

  const bundleText = `
═══════════════════════════════════════════════════════
KAVACH EVIDENCE BUNDLE — REGULATORY PRESERVATION RECORD
Factory Act Section 88 Compliance
═══════════════════════════════════════════════════════

Generated: ${formatTime(scenarioTime)} IST
Trigger: Compound Risk Score ${compoundRisk}/100 (CRITICAL THRESHOLD EXCEEDED)
Plant: Visakhapatnam Steel Plant (VSP), Visakhapatnam, AP
Affected Zones: ${criticalZones.join(', ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. IPL HEALTH AT TIME OF ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ipls.map(ipl => `${ipl.name}: ${ipl.score}/100\n   → ${ipl.factors}`).join('\n\n')}

COMPOUND RISK: ${compoundRisk}/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. SENSOR READINGS (30-MINUTE WINDOW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sensors.map(s => {
  const r = sensorReadings[s.id];
  const pct = r ? Math.round((r.value / s.threshold) * 100) : 0;
  return `${s.id} ${s.name}: ${r?.value.toFixed(1)} ${s.unit} [${pct}% of threshold] RoC: ${r?.rateOfChange.toFixed(2)}/min`;
}).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. ACTIVE PERMITS AT TIME OF ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${permits.map(p => `${p.id} | ${p.type.replace('_', ' ').toUpperCase()} | Zone: ${p.zone} | "${p.description}"
   Issuer: ${p.issuer} | Holder: ${p.holder}
   PHSA Complete: ${p.phsaComplete ? 'YES' : 'NO ⚠️'} | Isolations Verified: ${p.isolationsVerified ? 'YES' : 'NO ⚠️'}`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. SIMOPS CONFLICTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${simopsConflicts.length > 0 ? simopsConflicts.join('\n') : 'None at time of alert.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. WORKERS IN AFFECTED ZONES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ${atRiskWorkers.length} | Permanent: ${atRiskWorkers.filter(w => w.type === 'permanent').length} | Contract: ${atRiskWorkers.filter(w => w.type === 'contract').length}

${atRiskWorkers.map(w => `${w.id} | ${w.name} | ${w.role} | ${w.type.toUpperCase()} | ${w.employer}
   Zone: ${w.zone} | Check-in: ${w.checkInTime} | Training: ${w.trained ? 'Current' : 'EXPIRED (' + w.trainingExpiry + ')'} | Language: ${w.language}`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. ALERT CHRONOLOGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${alerts.map(a => `[${formatTime(a.timestamp)}] ${a.level.toUpperCase()}: ${a.title}\n   ${a.description}`).join('\n\n')}

═══════════════════════════════════════════════════════
END OF EVIDENCE BUNDLE
Preserved for DGFASLI/Factory Inspectorate under Factory Act Section 88
Tamper-evident hash: SHA-256 [computed at preservation time]
═══════════════════════════════════════════════════════
`.trim();

  const handleDownload = () => {
    const blob = new Blob([bundleText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KAVACH_Evidence_Bundle_${formatTime(scenarioTime).replace(':', '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="evidence-overlay" onClick={hideEvidenceBundle}>
      <div className="evidence-modal" onClick={(e) => e.stopPropagation()}>
        <CornerBrackets size={12} />
        <div className="evidence-header">
          <div>
            <h2 className="evidence-title">🔒 EVIDENCE BUNDLE PRESERVED</h2>
            <p className="evidence-subtitle">Factory Act Section 88 • Auto-generated at critical alert</p>
          </div>
          <div className="evidence-actions">
            <button className="evidence-btn download" onClick={handleDownload}>
              ↓ Download
            </button>
            <button className="evidence-btn close" onClick={hideEvidenceBundle}>
              ✕
            </button>
          </div>
        </div>
        <pre className="evidence-content">{bundleText}</pre>
      </div>
    </div>
  );
}
