/** Run in the document head, before native reload scroll restoration. */
export const initialScrollScript = `(() => {
  const navigation = performance.getEntriesByType("navigation")[0];
  const reset = navigation?.type !== "back_forward" && !location.hash;
  if ("scrollRestoration" in history) history.scrollRestoration = reset ? "manual" : "auto";
  if (reset) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
})();`;
