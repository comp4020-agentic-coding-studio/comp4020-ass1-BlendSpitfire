import type { Mode } from "./modes";
import { frequencyForDegree } from "./modes";

// Walk every degree of this mode's own scale, up and back down to the tonic.
// A pure function of how many notes the scale has, so it adapts automatically
// to 5-, 6-, or 7-note scales with no per-mode authoring.
export function buildScaleRunDegrees(noteCount: number): number[] {
  const ascending = Array.from({ length: noteCount }, (_, i) => i + 1);
  const descending = ascending.slice(0, -1).reverse();
  return [...ascending, ...descending];
}

// The one shared tune every non-pentatonic mode plays on click — climb
// stepwise almost to the top of the scale, then step back down to the tonic.
// Walking every degree in between (not just skipping in thirds) is what
// makes each mode's own color come through; every non-pentatonic mode has at
// least 6 degrees, so this needs no octave wrap.
export function buildSharedTuneDegrees(): number[] {
  return [1, 2, 3, 4, 5, 6, 5, 3, 1];
}

// A single ascending pass through every note of the scale, ending on the
// octave — what pentatonic scales play on click instead of the shared tune
// (too few degrees for that skeleton to land anywhere interesting).
export function buildAscendingRunDegrees(noteCount: number): number[] {
  return Array.from({ length: noteCount + 1 }, (_, i) => i + 1);
}

export interface MelodyEvent {
  degree: number;
  frequency: number;
  startMs: number;
  durationMs: number;
}

// Realizes any list of scale degrees (the shared tune, an ascending run, or a
// full scale-run) into playable events. All are triggered independently —
// this just turns degrees into pitches and timing.
export function realizeDegrees(tonicHz: number, mode: Mode, degrees: number[], noteDurationMs: number): MelodyEvent[] {
  return degrees.map((degree, index) => ({
    degree,
    frequency: frequencyForDegree(tonicHz, mode, degree),
    startMs: index * noteDurationMs,
    durationMs: noteDurationMs,
  }));
}
