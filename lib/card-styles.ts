export const CARD_COLORS = [
  "orange",
  "blue",
  "green",
  "pink",
  "yellow",
  "purple",
  "teal",
] as const;

export type CardColor = (typeof CARD_COLORS)[number];
export type TextureBlendMode = "difference" | "exclusion" | "lighten" | "screen";

const blendModeNames: Record<string, TextureBlendMode> = {
  difference: "difference",
  differences: "difference",
  exclusion: "exclusion",
  lighten: "lighten",
  screen: "screen",
};

const textureFiles = [
  "exclusion - screen.mp4",
  "differences - lighten.mp4",
  "lighten - exclusion.mp4",
  "exclusion.gif",
] as const;

export const CARD_TEXTURES = textureFiles.map((fileName) => {
  const blendModes = fileName.replace(/\.(mp4|gif)$/i, "").split(/\s*-\s*/).map((name) => {
    const mode = blendModeNames[name.toLowerCase()];
    if (!mode) throw new Error(`Unknown texture blend mode: ${name}`);
    return mode;
  });

  return {
    fileName,
    src: `/textures/${encodeURIComponent(fileName)}`,
    type: fileName.endsWith(".mp4") ? "video" as const : "image" as const,
    blendModes,
  };
});

export type CardTexture = (typeof CARD_TEXTURES)[number];

export type CardAppearance = {
  color: CardColor;
  texture: CardTexture;
  blendMode: TextureBlendMode;
};

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) {
    result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  }
  // Mix the low bits too, so texture and blend selections are independent.
  result = Math.imul(result ^ (result >>> 16), 0x85ebca6b);
  result = Math.imul(result ^ (result >>> 13), 0xc2b2ae35);
  return (result ^ (result >>> 16)) >>> 0;
}

/** Absolute slider positions can extend in either direction without restarting the cycle. */
export function getCardColor(position: number): CardColor {
  if (!Number.isSafeInteger(position)) {
    throw new Error("Card position must be a safe integer.");
  }

  const index = ((position % CARD_COLORS.length) + CARD_COLORS.length) % CARD_COLORS.length;
  return CARD_COLORS[index];
}

/** Ordered colors follow position; texture and blend choices stay tied to the record ID. */
export function getCardAppearance(id: string | number, position: number): CardAppearance {
  const texture = CARD_TEXTURES[hash(`${id}:texture`) % CARD_TEXTURES.length];

  return {
    color: getCardColor(position),
    texture,
    blendMode: texture.blendModes[hash(`${id}:blend`) % texture.blendModes.length],
  };
}
