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
