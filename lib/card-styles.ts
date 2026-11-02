export const CARD_COLORS = [
  "blue",
  "orange",
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

/** Shared by the UI and future backend; identical record IDs keep identical styles. */
export function getCardAppearance(id: string | number): CardAppearance {
  const texture = CARD_TEXTURES[hash(`${id}:texture`) % CARD_TEXTURES.length];

  return {
    color: CARD_COLORS[hash(`${id}:color`) % CARD_COLORS.length],
    texture,
    blendMode: texture.blendModes[hash(`${id}:blend`) % texture.blendModes.length],
  };
}
