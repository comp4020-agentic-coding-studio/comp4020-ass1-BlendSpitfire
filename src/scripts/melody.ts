import type { Mode } from "./modes";
import { frequencyForDegree } from "./modes";

// Scale degrees, not absolute pitches — the same skeleton is realized
// differently by every mode. Walks through the 2nd, 3rd and 6th, the degrees
// that most define a mode's character.
export const MELODY_SKELETON = [1, 2, 3, 4, 5, 6, 5, 3, 1];

export interface MelodyEvent {
  degree: number;
  frequency: number;
  startMs: number;
  durationMs: number;
}

export function realizeMelody(tonicHz: number, mode: Mode, noteDurationMs: number): MelodyEvent[] {
  return MELODY_SKELETON.map((degree, index) => ({
    degree,
    frequency: frequencyForDegree(tonicHz, mode, degree),
    startMs: index * noteDurationMs,
    durationMs: noteDurationMs,
  }));
}
