import type { MelodyEvent } from "./melody";

export interface PlaybackHandle {
  stop: () => void;
}

// One shared context, created lazily on first use (inside a user-gesture
// handler, satisfying browsers' autoplay policy) and reused for every
// playback — melody, scale-run, and single-note clicks alike. Recreating an
// AudioContext per call is wasteful and eventually hits browser limits, which
// matters once notes can be clicked in rapid succession.
let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  if (sharedContext.state === "suspended") {
    void sharedContext.resume();
  }
  return sharedContext;
}

// A small piano-like voice: the fundamental plus a couple of quieter
// harmonics (additive synthesis), with a fast attack and an exponential
// decay — the way a struck string actually loses energy — instead of one
// raw oscillator held at flat volume.
const HARMONICS = [
  { multiple: 1, gain: 1 },
  { multiple: 2, gain: 0.45 },
  { multiple: 3, gain: 0.2 },
  { multiple: 4, gain: 0.1 },
];
const ATTACK_S = 0.008;
const PEAK_GAIN = 0.22;
const DECAY_FLOOR = 0.001;

function playTone(
  audioContext: AudioContext,
  frequency: number,
  startAt: number,
  durationMs: number,
  nodes: OscillatorNode[],
): void {
  const durationS = durationMs / 1000;
  const voiceGain = audioContext.createGain();
  voiceGain.connect(audioContext.destination);

  voiceGain.gain.setValueAtTime(0, startAt);
  voiceGain.gain.linearRampToValueAtTime(PEAK_GAIN, startAt + ATTACK_S);
  voiceGain.gain.exponentialRampToValueAtTime(DECAY_FLOOR, startAt + durationS);
  voiceGain.gain.linearRampToValueAtTime(0, startAt + durationS + 0.02);

  for (const { multiple, gain } of HARMONICS) {
    const oscillator = audioContext.createOscillator();
    const harmonicGain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency * multiple;
    harmonicGain.gain.value = gain;
    oscillator.connect(harmonicGain);
    harmonicGain.connect(voiceGain);

    oscillator.start(startAt);
    oscillator.stop(startAt + durationS + 0.03);
    nodes.push(oscillator);
  }
}

export function playMelody(events: MelodyEvent[], onNoteStart: (event: MelodyEvent) => void): PlaybackHandle {
  const audioContext = getAudioContext();
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const oscillators: OscillatorNode[] = [];

  for (const event of events) {
    const startAt = audioContext.currentTime + event.startMs / 1000;
    playTone(audioContext, event.frequency, startAt, event.durationMs, oscillators);
    timeouts.push(setTimeout(() => onNoteStart(event), event.startMs));
  }

  return {
    stop: () => {
      for (const timeout of timeouts) clearTimeout(timeout);
      for (const oscillator of oscillators) {
        try {
          oscillator.stop();
        } catch {
          // already stopped
        }
      }
    },
  };
}

// Plays a single pitch immediately — used for clicking/tapping a note on the
// wheel, independent of whatever mode-melody might currently be playing.
export function playNote(frequency: number, durationMs = 500): void {
  const audioContext = getAudioContext();
  playTone(audioContext, frequency, audioContext.currentTime, durationMs, []);
}
