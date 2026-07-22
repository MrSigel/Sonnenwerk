/**
 * Feuert das Meta `Lead`-Event genau einmal (§15).
 * Voraussetzung: Der Pixel wurde bereits consent-gated geladen (window.fbq vorhanden).
 * Es werden KEINE personenbezogenen Formularinhalte übergeben — nur das Standard-Event.
 */
export function trackLead(): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return; // kein Consent / kein Pixel
  window.fbq("track", "Lead");
}
