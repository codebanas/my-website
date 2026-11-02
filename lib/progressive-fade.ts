export type FadeEdge = "top" | "left" | "right";

const directions = {
  top: "to bottom",
  left: "to right",
  right: "to left",
} as const;

/** Masked blur bands approximate Figma's progressive 16px-to-0px background blur. */
export function getProgressiveFade(edge: FadeEdge, strength: 2 | 6) {
  const direction = directions[edge];
  const gradient = `linear-gradient(${direction}, #0d0d0d 0%, rgb(13 13 13 / 0%) 100%)`;
  const steps = 8;

  return {
    backgroundImage: Array(strength).fill(gradient).join(", "),
    blurLayers: Array.from({ length: steps }, (_, index) => {
      const center = index * 100 / steps;
      const end = (index + 1) * 100 / steps;
      const start = Math.max(0, (index - 1) * 100 / steps);
      const stops = index === 0
        ? `#000 0%, transparent ${end}%`
        : `transparent ${start}%, #000 ${center}%, transparent ${end}%`;

      return {
        radius: 16 * (1 - index / steps),
        maskImage: `linear-gradient(${direction}, ${stops})`,
      };
    }),
  };
}
