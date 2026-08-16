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
// stepwise all the way to the 7th degree, then resolve back to the tonic by
// thirds. Touching every degree from 1 to 7 matters, not just style: modes
// that differ from each other in only one degree (e.g. Ionian vs Mixolydian,
// which differ only at the 7th) need that exact degree sounded, or the two
// tunes are literally the same notes. Some 6-note scales in this group
// (whole tone, blues) don't have a 7th degree of their own, so degree 7 there
// wraps to the octave above the tonic — still a fine landing point for the
// same phrase shape.
export function buildSharedTuneDegrees(): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 5, 3, 1];
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
