export interface Mode {
  id: string;
  name: string;
  character: string;
  color: string;
  offsets: number[];
}

const HALF = "H";
const WHOLE = "W";

function intervalPattern(offsets: number[]): string {
  const steps: string[] = [];
  for (let i = 0; i < offsets.length; i++) {
    const next = i + 1 < offsets.length ? offsets[i + 1] : 12;
    steps.push(next - offsets[i] === 1 ? HALF : WHOLE);
  }
  return steps.join("-");
}

export const MODES: Mode[] = [
  {
    id: "ionian",
    name: "Ionian (major)",
    character: "bright",
    color: "#f5b700",
    offsets: [0, 2, 4, 5, 7, 9, 11],
  },
  {
    id: "aeolian",
    name: "Aeolian (natural minor)",
    character: "sad",
    color: "#3a6ea5",
    offsets: [0, 2, 3, 5, 7, 8, 10],
  },
  {
    id: "dorian",
    name: "Dorian",
    character: "bittersweet",
    color: "#2f9e6b",
    offsets: [0, 2, 3, 5, 7, 9, 10],
  },
  {
    id: "phrygian",
    name: "Phrygian",
    character: "tense",
    color: "#a5305a",
    offsets: [0, 1, 3, 5, 7, 8, 10],
  },
];

export function modePattern(mode: Mode): string {
  return intervalPattern(mode.offsets);
}

// degree is 1-indexed, matching how scale degrees are spoken about musically.
export function frequencyForDegree(tonicHz: number, mode: Mode, degree: number): number {
  const semitones = mode.offsets[degree - 1];
  return tonicHz * 2 ** (semitones / 12);
}
