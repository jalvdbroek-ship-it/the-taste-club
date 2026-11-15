// Het beheerprototype heeft geen echte beveiliging en mag daarom alleen op een lokale of privenetwerk-host draaien.
export function isLocalHost(hostname) {
  const h = String(hostname || "").toLowerCase();
  if (h === "localhost" || h === "::1" || h === "[::1]" || h.endsWith(".local") || h.endsWith(".localhost")) return true;
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 127 || a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
}
export const adminAllowed = (config, hostname) => config.beheer?.toegestaanOpElkeHost === true || isLocalHost(hostname);
