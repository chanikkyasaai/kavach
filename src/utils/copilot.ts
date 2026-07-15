import type { IPLState, SensorReading, Alert } from '../store/useStore';
import type { Worker } from '../data/workers';
import type { Permit } from '../data/permits';
import { sensors } from '../data/sensors';
import { zones } from '../data/zones';
import { formatTime } from './lopa';

interface PlantContext {
  scenarioTime: number;
  compoundRisk: number;
  ipls: IPLState[];
  sensorReadings: Record<string, SensorReading>;
  workers: Worker[];
  permits: Permit[];
  alerts: Alert[];
  simopsConflicts: string[];
  criticalZones: string[];
}

function buildContextPrompt(ctx: PlantContext): string {
  const sensorSummary = sensors.map(s => {
    const reading = ctx.sensorReadings[s.id];
    const pctThreshold = reading ? Math.round((reading.value / s.threshold) * 100) : 0;
    return `  ${s.name} (${s.zone}): ${reading?.value.toFixed(1)} ${s.unit} [${pctThreshold}% of threshold] RoC: ${reading?.rateOfChange.toFixed(2)}/min`;
  }).join('\n');

  const iplSummary = ctx.ipls.map(ipl =>
    `  ${ipl.shortName} (IPL ${ipl.id.replace('ipl', '')}): Score ${ipl.score}/100 — ${ipl.factors}`
  ).join('\n');

  const workersByZone: Record<string, Worker[]> = {};
  ctx.workers.forEach(w => {
    if (!workersByZone[w.zone]) workersByZone[w.zone] = [];
    workersByZone[w.zone].push(w);
  });

  const workerSummary = Object.entries(workersByZone).map(([zone, wkrs]) => {
    const zoneName = zones.find(z => z.id === zone)?.name || zone;
    return `  ${zoneName} (${zone}): ${wkrs.map(w => `${w.name} [${w.type}/${w.role}/${w.employer}${!w.trained ? ' ⚠️ TRAINING EXPIRED' : ''}]`).join(', ')}`;
  }).join('\n');

  const permitSummary = ctx.permits.map(p =>
    `  ${p.id}: ${p.type.replace('_', ' ')} in ${p.zone} — "${p.description}" [PHSA: ${p.phsaComplete ? '✓' : '✗'}, Isolations: ${p.isolationsVerified ? '✓' : '✗'}] Holder: ${p.holder}`
  ).join('\n');

  const alertSummary = ctx.alerts.slice(-5).map(a =>
    `  [${a.level.toUpperCase()}] T=${formatTime(a.timestamp)}: ${a.title} — ${a.description}`
  ).join('\n');

  return `You are the KAVACH AI Safety Copilot — an industrial safety intelligence system deployed at Visakhapatnam Steel Plant (VSP). You provide specific, grounded, actionable safety intelligence based ONLY on the live plant data below. Never give generic safety advice. Always cite specific sensor values, worker names, permit numbers, and OISD rules.

CURRENT PLANT STATE at ${formatTime(ctx.scenarioTime)}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPOUND RISK SCORE: ${ctx.compoundRisk}/100 ${ctx.compoundRisk >= 85 ? '🚨 CRITICAL' : ctx.compoundRisk >= 70 ? '⚠️ HIGH' : ''}

IPL HEALTH SCORES:
${iplSummary}

LIVE SENSOR READINGS:
${sensorSummary}

WORKERS BY ZONE:
${workerSummary}

ACTIVE PERMITS:
${permitSummary}

SIMOPS CONFLICTS: ${ctx.simopsConflicts.length > 0 ? ctx.simopsConflicts.join('; ') : 'None detected'}

CRITICAL ZONES: ${ctx.criticalZones.length > 0 ? ctx.criticalZones.join(', ') : 'None'}

RECENT ALERTS:
${alertSummary || '  None'}

RESPONSE RULES:
- Be specific: cite sensor IDs, worker names, permit numbers, zone IDs
- Be actionable: recommend specific interventions
- Be concise: safety officers need answers in 30 seconds
- If asked "who is at risk" — list every worker in affected zones by name, type, and employer
- If asked about counterfactuals — recalculate the risk impact
- Never hallucinate data not present above`;
}

export async function queryCopilot(
  userMessage: string,
  context: PlantContext,
  apiKey?: string
): Promise<string> {
  const systemPrompt = buildContextPrompt(context);

  // If no API key, return a simulated intelligent response
  if (!apiKey) {
    return generateLocalResponse(userMessage, context);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Copilot API error:', error);
    return generateLocalResponse(userMessage, context);
  }
}

function generateLocalResponse(query: string, ctx: PlantContext): string {
  const q = query.toLowerCase();

  if (q.includes('who is at risk') || q.includes('workers at risk') || q.includes('who is in danger')) {
    const atRiskWorkers = ctx.workers.filter(w => ctx.criticalZones.includes(w.zone));
    if (atRiskWorkers.length === 0) {
      return `Currently no workers are in critical-risk zones. Compound risk is ${ctx.compoundRisk}/100. All zones at normal operating status.`;
    }
    const workerList = atRiskWorkers.map(w =>
      `• **${w.name}** — ${w.role} (${w.type}) | Employer: ${w.employer} | Zone: ${w.zone} | Training: ${w.trained ? 'Current' : '⚠️ EXPIRED (' + w.trainingExpiry + ')'} | Language: ${w.language}`
    ).join('\n');
    return `🚨 **${atRiskWorkers.length} workers in critical zones (${ctx.criticalZones.join(', ')})**:\n\n${workerList}\n\n**Immediate action required:**\n1. Initiate evacuation of Zone ${ctx.criticalZones[0]} — use PA system in Telugu, Hindi, and Odia\n2. Suspend PTW-437 and PTW-438 immediately\n3. Account for all ${atRiskWorkers.filter(w => w.type === 'contract').length} contract workers — they may not have received automated alerts\n4. Deploy rescue standby team to Melt Shop perimeter`;
  }

  if (q.includes('highest risk') || q.includes('most dangerous') || q.includes('what is the risk')) {
    const worstIPL = ctx.ipls.reduce((min, ipl) => ipl.score < min.score ? ipl : min);
    return `**Current highest risk area: Zone Z1 (Steel Melt Shop)**\n\nCompound Risk: **${ctx.compoundRisk}/100** ${ctx.compoundRisk >= 85 ? '🚨 CRITICAL' : ctx.compoundRisk >= 70 ? '⚠️ ELEVATED' : ''}\n\n**Most degraded protection layer:** ${worstIPL.name} at ${worstIPL.score}/100\n→ ${worstIPL.factors}\n\n**Contributing factors:**\n${ctx.ipls.filter(i => i.score < 80).map(i => `• ${i.shortName}: ${i.score}/100 — ${i.factors.split('.')[0]}`).join('\n')}\n\n**Recommended intervention:** ${ctx.compoundRisk >= 85 ? 'IMMEDIATE EVACUATION of Z1. Suspend all hot work permits. Deploy emergency response team.' : ctx.compoundRisk >= 70 ? 'Escalate to Plant Manager. Consider suspending PTW-438 (incomplete PHSA). Verify SIS proof test status.' : 'Monitor closely. No immediate intervention required.'}`;
  }

  if (q.includes('cancel') || q.includes('suspend') || q.includes('ptw-441') || q.includes('ptw-438') || q.includes('what if')) {
    const currentRisk = ctx.compoundRisk;
    const estimatedNewRisk = Math.max(currentRisk - 12, 30);
    return `**Counterfactual Analysis: Suspending permit**\n\nIf the referenced permit is suspended:\n• IPL-3 (PTW) score would improve from ${ctx.ipls[2].score} → ~${Math.min(ctx.ipls[2].score + 20, 95)}\n• SIMOPS conflict would be resolved\n• Compound risk: ${currentRisk} → ~${estimatedNewRisk} (Δ${currentRisk - estimatedNewRisk} reduction)\n\n**Assessment:** ${currentRisk - estimatedNewRisk > 10 ? 'Significant risk reduction. Recommend proceeding with suspension.' : 'Moderate improvement. Additional interventions may be needed.'}\n\n**Note:** This does not address the underlying BPCS degradation (sensor anomalies) or SIS proof test overdue status. Full risk recovery requires:\n1. Suspend conflicting permit\n2. Complete SIS proof test on BOF ESD\n3. Address understaffing in Z1`;
  }

  if (q.includes('summarize') || q.includes('shift log') || q.includes('what happened') || q.includes('last 30 minutes')) {
    return `**Shift Log Summary — ${formatTime(Math.max(0, ctx.scenarioTime - 30))} to ${formatTime(ctx.scenarioTime)}**\n\n${ctx.alerts.slice(-6).map(a => `${formatTime(a.timestamp)} | [${a.level.toUpperCase()}] ${a.title}: ${a.description.slice(0, 100)}...`).join('\n\n')}\n\n**Current State:** Compound Risk ${ctx.compoundRisk}/100 | ${ctx.criticalZones.length} critical zones | ${ctx.simopsConflicts.length} SIMOPS conflicts active | ${ctx.workers.filter(w => ctx.criticalZones.includes(w.zone)).length} workers in risk zones`;
  }

  if (q.includes('evacuation') || q.includes('evacuate')) {
    const evacuees = ctx.workers.filter(w => ctx.criticalZones.includes(w.zone));
    return `**EVACUATION LIST — Zones: ${ctx.criticalZones.join(', ')}**\n\nGenerated: ${formatTime(ctx.scenarioTime)} | Total personnel: ${evacuees.length}\n\n${evacuees.map((w, i) => `${i + 1}. **${w.name}** | ${w.role} | ${w.type.toUpperCase()} | ${w.employer} | Zone: ${w.zone} | Check-in: ${w.checkInTime} | Language: ${w.language}`).join('\n')}\n\n**Evacuation priorities:**\n1. Contract workers without current training: ${evacuees.filter(w => !w.trained).map(w => w.name).join(', ') || 'None'}\n2. Workers in confined spaces (PTW-438): Check ladle shell #4 area\n3. All remaining personnel via nearest muster point\n\n**Communication:** PA announcement required in Telugu, Hindi, Odia, Bengali`;
  }

  return `**Plant Status at ${formatTime(ctx.scenarioTime)}**\n\nCompound Risk: ${ctx.compoundRisk}/100\nActive Alerts: ${ctx.alerts.filter(a => !a.acknowledged).length}\nSIMOPS Conflicts: ${ctx.simopsConflicts.length}\nWorkers in plant: ${ctx.workers.length} (${ctx.workers.filter(w => w.type === 'contract').length} contract)\n\nAsk me about:\n• "Who is at risk right now?"\n• "What is the highest risk area?"\n• "What if I suspend PTW-438?"\n• "Generate evacuation list"\n• "Summarize last 30 minutes for shift log"`;
}
