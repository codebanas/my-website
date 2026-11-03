const fadeMarker = 32;
const minimumOpacity = 0.05;

export function getScrollFadeOpacity(currentTop: number, initialTop: number): number {
  if (currentTop <= fadeMarker) return minimumOpacity;
  if (currentTop >= initialTop) return 1;
  const progress = (initialTop - currentTop) / (initialTop - fadeMarker);
  return Math.max(minimumOpacity, Math.min(1, 1 - progress * (1 - minimumOpacity)));
}
