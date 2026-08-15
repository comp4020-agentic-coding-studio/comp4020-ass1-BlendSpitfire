export interface Mode {
  id: string;
  name: string;
  character: string;
  description: string;
  color: string;
  group: "church" | "other" | "pentatonic";
  offsets: number[];
  // A short, hand-composed phrase in this mode's own scale degrees (1-indexed,
  // may reach offsets.length + 1 for the octave above the tonic).
  tune: number[];
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
    description:
      "The default major scale in Western music — bright, stable, and everywhere from nursery rhymes to symphonies. No single culture claims it; it's the common ground most Western ears expect.",
    color: "hsl(40deg 82% 50%)",
    group: "church",
    offsets: [0, 2, 4, 5, 7, 9, 11],
    tune: [1, 3, 5, 8, 5, 3, 1],
  },
  {
    id: "dorian",
    name: "Dorian",
    character: "bittersweet",
    description:
      "A staple of Celtic and Irish folk music, and the sound Miles Davis reached for on “So What.” Minor-ish but with a raised 6th that keeps it from turning fully sad — often described as bittersweet or wistful.",
    color: "hsl(150deg 82% 50%)",
    group: "church",
    offsets: [0, 2, 3, 5, 7, 9, 10],
    tune: [1, 3, 5, 6, 5, 3, 1],
  },
  {
    id: "phrygian",
    name: "Phrygian",
    character: "tense",
    description:
      "The color behind flamenco and much Mediterranean and Middle Eastern folk music, driven by its half-step down from the tonic. Tense, dramatic, often heard as exotic or unsettled.",
    color: "hsl(320deg 82% 50%)",
    group: "church",
    offsets: [0, 1, 3, 5, 7, 8, 10],
    tune: [1, 2, 1, 3, 5, 3, 1],
  },
  {
    id: "lydian",
    name: "Lydian",
    character: "dreamlike",
    description:
      "Beloved by film composers for its floating, slightly unresolved brightness — the raised 4th is the giveaway. No strong folk tradition of its own; it's largely a 20th-century orchestral and jazz color.",
    color: "hsl(50deg 82% 50%)",
    group: "church",
    offsets: [0, 2, 4, 6, 7, 9, 11],
    tune: [1, 3, 5, 4, 5, 8, 1],
  },
  {
    id: "mixolydian",
    name: "Mixolydian",
    character: "bright but unresolved",
    description:
      "Common in Celtic music and blues-rock alike — a major scale with a flattened 7th that keeps it from resolving too neatly. Bright, but with a bit of grit.",
    color: "hsl(30deg 82% 50%)",
    group: "church",
    offsets: [0, 2, 4, 5, 7, 9, 10],
    tune: [1, 3, 5, 7, 8, 7, 1],
  },
  {
    id: "aeolian",
    name: "Aeolian (natural minor)",
    character: "sad",
    description:
      "The default minor scale in Western music, and Ionian's mirror image. Melancholic and introspective — no single-country claim, just the common minor sound.",
    color: "hsl(215deg 82% 50%)",
    group: "church",
    offsets: [0, 2, 3, 5, 7, 8, 10],
    tune: [1, 3, 4, 5, 3, 1],
  },
  {
    id: "locrian",
    name: "Locrian",
    character: "unstable",
    description:
      "The one church mode with almost no folk-music life of its own — its diminished 5th above the tonic makes it hard to resolve. Lives mostly in jazz theory and experimental music, where its instability is the point.",
    color: "hsl(345deg 82% 50%)",
    group: "church",
    offsets: [0, 1, 3, 5, 6, 8, 10],
    // Deliberately doesn't resolve back to the tonic — Locrian's whole
    // character is that its 5th won't let it resolve cleanly.
    tune: [1, 2, 3, 4, 5, 4, 2],
  },
  {
    id: "harmonic-minor",
    name: "Harmonic minor",
    character: "exotic, dramatic",
    description:
      "The raised 7th gives this scale a dramatic pull toward the tonic, and it turns up across Balkan, Klezmer, and flamenco traditions — plus a lot of film-score villain entrances. Exotic, tense, theatrical.",
    color: "hsl(285deg 82% 50%)",
    group: "other",
    offsets: [0, 2, 3, 5, 7, 8, 11],
    tune: [1, 3, 5, 7, 8, 5, 1],
  },
  {
    id: "melodic-minor",
    name: "Melodic minor (ascending)",
    character: "hopeful minor",
    description:
      "A jazz staple — a minor scale with the 6th and 7th raised, softening the usual sadness into something more hopeful and unresolved.",
    color: "hsl(175deg 82% 50%)",
    group: "other",
    offsets: [0, 2, 3, 5, 7, 9, 11],
    tune: [1, 3, 5, 6, 7, 8, 1],
  },
  {
    id: "whole-tone",
    name: "Whole tone",
    character: "floating, ambiguous",
    description:
      "No half-steps at all, which is exactly why it has no clear “home” note. Claude Debussy made it his signature — dreamlike, floating, deliberately ambiguous.",
    color: "hsl(195deg 82% 50%)",
    group: "other",
    offsets: [0, 2, 4, 6, 8, 10],
    tune: [1, 3, 5, 6, 3, 1],
  },
  {
    id: "blues",
    name: "Blues scale",
    character: "gritty, soulful",
    description:
      "Rooted in African-American blues and early jazz, built around a flattened 5th “blue note” that bends against the rest of the scale. Gritty, vocal, unmistakably human.",
    color: "hsl(10deg 82% 50%)",
    group: "other",
    offsets: [0, 3, 5, 6, 7, 10],
    tune: [1, 3, 4, 3, 5, 6, 1],
  },
  {
    id: "major-pentatonic",
    name: "Major pentatonic (宮调式, “Gong” mode)",
    character: "open, stable",
    description:
      "Same intervals as the Gong mode in the traditional Chinese pentatonic system, and just as central to Scottish, Appalachian, and West African folk music. No half-steps at all — open and almost impossible to play “wrong.”",
    color: "hsl(90deg 82% 50%)",
    group: "pentatonic",
    offsets: [0, 2, 4, 7, 9],
    tune: [1, 2, 3, 5, 3, 2, 1],
  },
  {
    id: "japanese-in",
    name: "Japanese In scale (都節音階)",
    character: "restrained, melancholic",
    description:
      "A hallmark of traditional Japanese music, especially shamisen and shakuhachi playing. Its half-step sitting right next to a wide leap gives it a restrained, melancholic character distinct from Western scales.",
    color: "hsl(260deg 82% 50%)",
    group: "pentatonic",
    offsets: [0, 1, 5, 7, 8],
    // The half-step (degree 2) sitting right next to the wide leap up to
    // degree 5 is exactly what gives this scale its character.
    tune: [1, 2, 1, 5, 3, 1],
  },
];

export function modePattern(mode: Mode): string {
  return intervalPattern(mode.offsets);
}

// degree is 1-indexed, matching how scale degrees are spoken about musically.
// degree can exceed offsets.length — it wraps into the next octave up
// (degree = offsets.length + 1 lands exactly one octave above the tonic).
export function frequencyForDegree(tonicHz: number, mode: Mode, degree: number): number {
  const zeroIndexed = degree - 1;
  const octave = Math.floor(zeroIndexed / mode.offsets.length);
  const withinScale = zeroIndexed % mode.offsets.length;
  const semitones = mode.offsets[withinScale] + octave * 12;
  return tonicHz * 2 ** (semitones / 12);
}
