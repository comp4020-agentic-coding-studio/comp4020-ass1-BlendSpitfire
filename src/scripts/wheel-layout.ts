export interface Point {
  x: number;
  y: number;
}

export interface WheelNote {
  semitone: number;
  label: string;
  isNatural: boolean;
  point: Point;
  radius: number;
}

const NATURAL_LABELS = ["C", "D", "E", "F", "G", "A", "B"];
const NATURAL_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
const ACCIDENTAL_LABELS: Record<number, string> = { 1: "C♯", 3: "D♯", 6: "F♯", 8: "G♯", 10: "A♯" };

// Breathing room so neither a natural-natural nor an accidental-natural pair
// ever touches — the notch a small circle sits in is real empty space, not a
// tangent point.
const NOTCH_CLEARANCE = 6;

function toXY(angleDeg: number, radius: number, center: Point): Point {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  };
}

// The 7 natural notes (piano white keys) sit at 7 equally-spaced angles — not
// spaced by true semitone distance — with a small gap so neighbours never touch.
// The 5 accidentals (piano black keys; none between E-F or B-C) nest into the
// notch that opens up outside the point where two neighbouring naturals meet.
export function layoutWheel(center: Point, ringRadius: number, bigRadius: number, smallRadius: number): WheelNote[] {
  const notes: WheelNote[] = [];
  const step = 360 / 7;
  const halfStepRad = (Math.PI / 180) * (step / 2);

  for (let i = 0; i < 7; i++) {
    const angle = i * step;
    notes.push({
      semitone: NATURAL_SEMITONES[i],
      label: NATURAL_LABELS[i],
      isNatural: true,
      point: toXY(angle, ringRadius, center),
      radius: bigRadius,
    });

    const accidentalSemitone = (NATURAL_SEMITONES[i] + 1) % 12;
    const label = ACCIDENTAL_LABELS[accidentalSemitone];
    if (label) {
      const gapAngle = angle + step / 2;
      const clearedDistance = bigRadius + smallRadius + NOTCH_CLEARANCE;
      const gapRadius =
        ringRadius * Math.cos(halfStepRad) +
        Math.sqrt(clearedDistance ** 2 - (ringRadius * Math.sin(halfStepRad)) ** 2);
      notes.push({
        semitone: accidentalSemitone,
        label,
        isNatural: false,
        point: toXY(gapAngle, gapRadius, center),
        radius: smallRadius,
      });
    }
  }

  return notes;
}
