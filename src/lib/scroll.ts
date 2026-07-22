/** Sanft nach ganz oben scrollen (respektiert prefers-reduced-motion). */
export function scrollToTop() {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}
