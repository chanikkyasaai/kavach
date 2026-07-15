import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { getEdgeState } from './lopa';
import type { EdgeState } from './lopa';

let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!sharedCtx) {
    const AudioCtxCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedCtx = new AudioCtxCtor();
  }
  return sharedCtx;
}

function tone(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number, type: OscillatorType = 'sine') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

function playNormalBeep(ctx: AudioContext) {
  tone(ctx, 440, ctx.currentTime, 0.35, 0.05, 'sine');
}

function playWarningBeep(ctx: AudioContext) {
  const now = ctx.currentTime;
  tone(ctx, 600, now, 0.14, 0.07, 'sine');
  tone(ctx, 600, now + 0.18, 0.14, 0.07, 'sine');
}

function playCriticalBeep(ctx: AudioContext) {
  const now = ctx.currentTime;
  tone(ctx, 800, now, 0.1, 0.09, 'sine');
  tone(ctx, 800, now + 0.14, 0.1, 0.09, 'sine');
  tone(ctx, 800, now + 0.28, 0.1, 0.09, 'sine');
}

function playEmergencyAlarm(ctx: AudioContext) {
  // Fast hi-lo klaxon (like a fire/air-raid siren), not a smooth glide —
  // rapid square-wave alternation reads as urgent/dangerous rather than toylike.
  const now = ctx.currentTime;
  const LO = 740;
  const HI = 1500;
  const stepDur = 0.075;
  const steps = 10;
  const totalDur = steps * stepDur;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  for (let i = 0; i < steps; i++) {
    osc.frequency.setValueAtTime(i % 2 === 0 ? HI : LO, now + i * stepDur);
  }
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.11, now + 0.015);
  gain.gain.setValueAtTime(0.11, now + totalDur - 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + totalDur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + totalDur + 0.02);

  // Slightly detuned sawtooth layer underneath adds harsh, siren-like edge.
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sawtooth';
  for (let i = 0; i < steps; i++) {
    osc2.frequency.setValueAtTime((i % 2 === 0 ? HI : LO) * 1.015, now + i * stepDur);
  }
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.05, now + 0.015);
  gain2.gain.setValueAtTime(0.05, now + totalDur - 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + totalDur);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + totalDur + 0.02);
}

function playResolutionTone(ctx: AudioContext) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.linearRampToValueAtTime(800, now + 1.5);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
  gain.gain.linearRampToValueAtTime(0.12, now + 1.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 1.65);

  // Quiet fifth-above harmonic layer for warmth on the "system breathing again" moment
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(450, now);
  osc2.frequency.linearRampToValueAtTime(1200, now + 1.5);
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.04, now + 0.1);
  gain2.gain.linearRampToValueAtTime(0.04, now + 1.3);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 1.65);
}

const LOOP_INTERVAL_MS: Record<EdgeState, number> = {
  normal: 8000,
  warning: 4000,
  critical: 2000,
  emergency: 850,
};

function playForState(ctx: AudioContext, state: EdgeState) {
  if (state === 'normal') playNormalBeep(ctx);
  else if (state === 'warning') playWarningBeep(ctx);
  else if (state === 'critical') playCriticalBeep(ctx);
  else playEmergencyAlarm(ctx);
}

const RESOLUTION_DROP_THRESHOLD = 15;

/** Programmatic Web Audio ambient soundscape — no audio files, no API keys. */
export function useAmbientSound() {
  const compoundRisk = useStore(s => s.compoundRisk);
  const soundMuted = useStore(s => s.soundMuted);
  const edgeState = getEdgeState(compoundRisk);

  const [unlocked, setUnlocked] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const prevRiskRef = useRef(compoundRisk);

  // Browser autoplay policy: only start audio after a genuine user gesture.
  useEffect(() => {
    if (unlocked) return;
    const unlock = () => {
      const ctx = getContext();
      if (ctx.state === 'suspended') ctx.resume();
      setUnlocked(true);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [unlocked]);

  // Ambient loop matching the current edge-lighting state.
  useEffect(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!unlocked || soundMuted) return;

    const ctx = getContext();
    const interval = LOOP_INTERVAL_MS[edgeState];

    const loop = () => {
      playForState(ctx, edgeState);
      timeoutRef.current = window.setTimeout(loop, interval);
    };
    loop();

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [edgeState, soundMuted, unlocked]);

  // Ascending resolution tone whenever risk drops by 15+ points in one update.
  useEffect(() => {
    const prev = prevRiskRef.current;
    if (unlocked && !soundMuted && prev - compoundRisk >= RESOLUTION_DROP_THRESHOLD) {
      playResolutionTone(getContext());
    }
    prevRiskRef.current = compoundRisk;
  }, [compoundRisk, unlocked, soundMuted]);
}
