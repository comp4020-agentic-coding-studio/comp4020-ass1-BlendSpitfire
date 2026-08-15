export interface Mode {
  id: string;
  name: string;
  character: string;
  description: string;
  color: string;
  group: "church" | "other" | "pentatonic";
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
    description:
      "The default major scale in Western music — bright, stable, and everywhere from nursery rhymes to symphonies. No single culture claims it; it's the common ground most Western ears expect.",
    color: "hsl(40 68% 58%)",
    group: "church",
    offsets: [0, 2, 4, 5, 7, 9, 11],
  },
  {
    id: "dorian",
    name: "Dorian",
    character: "bittersweet",
    description:
      "A staple of Celtic and Irish folk music, and the sound Miles Davis reached for on “So What.” Minor-ish but with a raised 6th that keeps it from turning fully sad — often described as bittersweet or wistful.",
    color: "hsl(150 68% 58%)",
    group: "church",
    offsets: [0, 2, 3, 5, 7, 9, 10],
  },
  {
    id: "phrygian",
    name: "Phrygian",
    character: "tense",
    description:
      "The color behind flamenco and much Mediterranean and Middle Eastern folk music, driven by its half-step down from the tonic. Tense, dramatic, often heard as exotic or unsettled.",
    color: "hsl(320 68% 58%)",
    group: "church",
    offsets: [0, 1, 3, 5, 7, 8, 10],
  },
  {
    id: "lydian",
    name: "Lydian",
    character: "dreamlike",
    description:
      "Beloved by film composers for its floating, slightly unresolved brightness — the raised 4th is the giveaway. No strong folk tradition of its own; it's largely a 20th-century orchestral and jazz color.",
    color: "hsl(50 68% 58%)",
    group: "church",
    offsets: [0, 2, 4, 6, 7, 9, 11],
  },
  {
    id: "mixolydian",
    name: "Mixolydian",
    character: "bright but unresolved",
    description:
      "Common in Celtic music and blues-rock alike — a major scale with a flattened 7th that keeps it from resolving too neatly. Bright, but with a bit of grit.",
    color: "hsl(30 68% 58%)",
    group: "church",
    offsets: [0, 2, 4, 5, 7, 9, 10],
  },
  {
    id: "aeolian",
    name: "Aeolian (natural minor)",
    character: "sad",
    description:
      "The default minor scale in Western music, and Ionian's mirror image. Melancholic and introspective — no single-country claim, just the common minor sound.",
    color: "hsl(215 68% 58%)",
    group: "church",
    offsets: [0, 2, 3, 5, 7, 8, 10],
  },
  {
    id: "locrian",
    name: "Locrian",
    character: "unstable",
    description:
      "The one church mode with almost no folk-music life of its own — its diminished 5th above the tonic makes it hard to resolve. Lives mostly in jazz theory and experimental music, where its instability is the point.",
    color: "hsl(345 68% 58%)",
    group: "church",
    offsets: [0, 1, 3, 5, 6, 8, 10],
  },
  {
    id: "harmonic-minor",
    name: "Harmonic minor",
    character: "exotic, dramatic",
    description:
      "The raised 7th gives this scale a dramatic pull toward the tonic, and it turns up across Balkan, Klezmer, and flamenco traditions — plus a lot of film-score villain entrances. Exotic, tense, theatrical.",
    color: "hsl(285 68% 58%)",
    group: "other",
    offsets: [0, 2, 3, 5, 7, 8, 11],
  },
  {
    id: "melodic-minor",
    name: "Melodic minor (ascending)",
    character: "hopeful minor",
    description:
      "A jazz staple — a minor scale with the 6th and 7th raised, softening the usual sadness into something more hopeful and unresolved.",
    color: "hsl(175 68% 58%)",
    group: "other",
    offsets: [0, 2, 3, 5, 7, 9, 11],
  },
  {
    id: "whole-tone",
    name: "Whole tone",
    character: "floating, ambiguous",
    description:
      "No half-steps at all, which is exactly why it has no clear “home” note. Claude Debussy made it his signature — dreamlike, floating, deliberately ambiguous.",
    color: "hsl(195 68% 58%)",
    group: "other",
    offsets: [0, 2, 4, 6, 8, 10],
  },
  {
    id: "blues",
    name: "Blues scale",
    character: "gritty, soulful",
    description:
      "Rooted in African-American blues and early jazz, built around a flattened 5th “blue note” that bends against the rest of the scale. Gritty, vocal, unmistakably human.",
    color: "hsl(10 68% 58%)",
    group: "other",
    offsets: [0, 3, 5, 6, 7, 10],
  },
  {
    id: "major-pentatonic",
    name: "Major pentatonic (宮调式, “Gong” mode)",
    character: "open, stable",
    description:
      "Same intervals as the Gong mode in the traditional Chinese pentatonic system, and just as central to Scottish, Appalachian, and West African folk music. No half-steps at all — open and almost impossible to play “wrong.”",
    color: "hsl(90 68% 58%)",
    group: "pentatonic",
    offsets: [0, 2, 4, 7, 9],
  },
  {
    id: "japanese-in",
    name: "Japanese In scale (都節音階)",
    character: "restrained, melancholic",
    description:
      "A hallmark of traditional Japanese music, especially shamisen and shakuhachi playing. Its half-step sitting right next to a wide leap gives it a restrained, melancholic character distinct from Western scales.",
    color: "hsl(260 68% 58%)",
    group: "pentatonic",
    offsets: [0, 1, 5, 7, 8],
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
