export type FadeEdge = "top" | "left" | "right";

const directions = {
  top: "to bottom",
  left: "to right",
  right: "to left",
} as const;

/** Masked blur bands approximate Figma's progressive 16px-to-0px background blur. */
export function getProgressiveFade(edge: FadeEdge, strength: 2 | 6, maxBlur = 16) {
  const direction = directions[edge];
  const isSide = edge !== "top";
  // Leave the final 20% clear so blur/tint cannot expose the overlay boundary.
  const fadeEnd = isSide ? 80 : 100;
  const gradientStops = isSide
    ? "#0d0d0d 0%, rgb(13 13 13 / 96%) 10%, rgb(13 13 13 / 84%) 20%, " +
      "rgb(13 13 13 / 68%) 30%, rgb(13 13 13 / 50%) 40%, " +
      "rgb(13 13 13 / 32%) 50%, rgb(13 13 13 / 16%) 60%, " +
      "rgb(13 13 13 / 4%) 70%, rgb(13 13 13 / 0%) 80%, rgb(13 13 13 / 0%) 100%"
    : "#0d0d0d 0%, rgb(13 13 13 / 0%) 100%";
  const gradient = `linear-gradient(${direction}, ${gradientStops})`;
  const steps = 8;

  return {
    backgroundImage: Array(strength).fill(gradient).join(", "),
    blurLayers: Array.from({ length: steps }, (_, index) => {
      const center = index * fadeEnd / steps;
      const end = (index + 1) * fadeEnd / steps;
      const start = Math.max(0, (index - 1) * fadeEnd / steps);
      const clearTail = end < 100 ? ", transparent 100%" : "";
      const stops = index === 0
        ? `#000 0%, transparent ${end}%${clearTail}`
        : `transparent ${start}%, #000 ${center}%, transparent ${end}%${clearTail}`;

      return {
        radius: maxBlur * (1 - index / steps),
        maskImage: `linear-gradient(${direction}, ${stops})`,
      };
    }),
  };
}
