// Evenementen: alleen bevestigde evenementen tellen; reserveren kan alleen met bevestiging, plaatsen en een toekomstige datum.
export const isoDay = (d = new Date()) => d.toISOString().slice(0, 10);
export const isConfirmed = (e) => e && e.bevestigd === true && !e.demo;
export function visibleEvents(events, today = isoDay()) {
  return events.filter((e) => isConfirmed(e) && (!e.datum || e.datum >= today)).sort((a, b) => String(a.datum).localeCompare(String(b.datum)));
}
export const canReserve = (e, today = isoDay()) => isConfirmed(e) && Number.isInteger(e.plaatsen) && e.plaatsen > 0 && !!e.datum && e.datum >= today;
export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
}
