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

export interface MelodyEvent {
  degree: number;
  frequency: number;
  startMs: number;
  durationMs: number;
}

// Realizes any list of scale degrees (a mode's hand-composed `tune`, or a
// scale-run from buildScaleRunDegrees) into playable events. The two are
// triggered independently — this just turns degrees into pitches and timing.
export function realizeDegrees(tonicHz: number, mode: Mode, degrees: number[], noteDurationMs: number): MelodyEvent[] {
  return degrees.map((degree, index) => ({
    degree,
    frequency: frequencyForDegree(tonicHz, mode, degree),
    startMs: index * noteDurationMs,
    durationMs: noteDurationMs,
  }));
}
