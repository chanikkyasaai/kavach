import { scenarioTimeline, SCENARIO_DURATION_MINUTES } from '../data/scenario';

/** Reads the same narrative timeline the live scenario uses, so Run Forward's
 *  physical readings (gas/pressure) stay consistent with the live replay —
 *  only the organizational (Level 1/2) variables differ between the two. */
export function getTimelineSensorValueAt(sensorId: string, minute: number, baseline: number): number {
  let value = baseline;
  for (const event of scenarioTimeline) {
    if (event.timeMinute > minute) break;
    for (const effect of event.effects) {
      if (effect.target === sensorId && effect.field === 'value') {
        value = effect.value as number;
      }
    }
  }
  return value;
}

/** The live SIMOPS conflict (PTW-437 × PTW-438) becomes active at T+31m. */
export function getTimelineSimopsConflictsAt(minute: number): number {
  return minute >= 31 ? 1 : 0;
}

export const RUN_FORWARD_SPEED = 10;
export const RUN_FORWARD_DURATION_MINUTES = SCENARIO_DURATION_MINUTES;
