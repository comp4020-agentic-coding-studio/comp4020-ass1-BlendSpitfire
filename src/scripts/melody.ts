import type { Mode } from "./modes";
import { frequencyForDegree } from "./modes";

// Segment 1: walk every degree of this mode's own scale, up and back down to
// the tonic. A pure function of how many notes the scale has, so it adapts
// automatically to 5-, 6-, or 7-note scales with no per-mode authoring.
export function buildScaleRunDegrees(noteCount: number): number[] {
  const ascending = Array.from({ length: noteCount }, (_, i) => i + 1);
  const descending = ascending.slice(0, -1).reverse();
  return [...ascending, ...descending];
}

// Segment 2: the short, memorable "character" tune. Two hand-written
// variants with the same contour — climb almost to the top, step down, drop
// further, resolve to the tonic — sized to how many degrees are available.
export const CHARACTER_SKELETON = [1, 2, 3, 4, 5, 6, 5, 3, 1];
export const CHARACTER_SKELETON_PENTATONIC = [1, 2, 3, 4, 5, 4, 2, 1];

const SEGMENT_GAP_MS = 150;

export interface MelodyEvent {
  degree: number;
  segment: "scan" | "character";
  frequency: number;
  startMs: number;
  durationMs: number;
}

function realizeSegment(
  tonicHz: number,
  mode: Mode,
  degrees: number[],
  segment: MelodyEvent["segment"],
  noteDurationMs: number,
  startAtMs: number,
): MelodyEvent[] {
  return degrees.map((degree, index) => ({
    degree,
    segment,
    frequency: frequencyForDegree(tonicHz, mode, degree),
    startMs: startAtMs + index * noteDurationMs,
    durationMs: noteDurationMs,
  }));
}

export function realizeMelody(tonicHz: number, mode: Mode, noteDurationMs: number): MelodyEvent[] {
  const scan = realizeSegment(
    tonicHz,
    mode,
    buildScaleRunDegrees(mode.offsets.length),
    "scan",
    noteDurationMs,
    0,
  );
  const scanEndMs = scan.length > 0 ? scan[scan.length - 1].startMs + noteDurationMs : 0;

  const characterSkeleton = mode.offsets.length === 5 ? CHARACTER_SKELETON_PENTATONIC : CHARACTER_SKELETON;
  const character = realizeSegment(
    tonicHz,
    mode,
    characterSkeleton,
    "character",
    noteDurationMs,
    scanEndMs + SEGMENT_GAP_MS,
  );

  return [...scan, ...character];
}
