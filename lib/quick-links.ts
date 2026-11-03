export const quickLinks = [
  "Home",
  "How It Works?",
  "Buy Me a Coffee",
  "Community",
  "Latest Updates",
  "Our Story",
  "Supporter Stories",
  "FAQs",
  "Contact",
] as const;

export function getQuickLinkWindow(activeIndex: number, linkCount: number) {
  const visibleCount = Math.min(3, linkCount);
  const start = Math.max(0, Math.min(activeIndex - 1, linkCount - visibleCount));
  return { start, end: start + visibleCount };
}

export function hasReachedPageEnd(scrollTop: number, scrollHeight: number, viewportHeight: number) {
  return Math.ceil(scrollTop + viewportHeight) >= scrollHeight;
}

export function getQuickLinkCueState({ scrollTop, scrollHeight, viewportHeight, cueBottom, reducedMotion = false }: {
  scrollTop: number;
  scrollHeight: number;
  viewportHeight: number;
  cueBottom: number;
  reducedMotion?: boolean;
}) {
  const maximumScroll = Math.max(0, scrollHeight - viewportHeight);
  const atEnd = maximumScroll > 0 && hasReachedPageEnd(scrollTop, scrollHeight, viewportHeight);
  const start = Math.max(0, cueBottom - viewportHeight);
  const end = Math.min(maximumScroll, start + Math.min(160, viewportHeight * 0.2));
  const progress = atEnd || maximumScroll === 0 ? 0 : reducedMotion ? 1
    : Math.max(0, Math.min(1, (scrollTop - start) / Math.max(1, end - start)));
  return { progress, atEnd };
}
