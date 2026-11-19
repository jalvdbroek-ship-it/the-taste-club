// Feestdagen: welke periode loopt er nu? Buiten een periode volgt de eerstvolgende, met actief = false.
const parse = (md) => { const [m, d] = md.split("-").map(Number); return { m, d, n: m * 100 + d }; };

export function inPeriode(fd, datum) {
  const s = parse(fd.start).n, e = parse(fd.einde).n, n = (datum.getMonth() + 1) * 100 + datum.getDate();
  return s <= e ? n >= s && n <= e : n >= s || n <= e;
}

const dagenTot = (fd, datum) => {
  const { m, d } = parse(fd.start);
  const vandaag = Date.UTC(datum.getFullYear(), datum.getMonth(), datum.getDate());
  let start = Date.UTC(datum.getFullYear(), m - 1, d);
  if (start < vandaag) start = Date.UTC(datum.getFullYear() + 1, m - 1, d);
  return Math.round((start - vandaag) / 86400000);
};

export function huidigeFeestdag(feestdagen, datum = new Date()) {
  const nu = feestdagen.find((fd) => inPeriode(fd, datum));
  if (nu) return { feestdag: nu, actief: true };
  const volgende = [...feestdagen].sort((a, b) => dagenTot(a, datum) - dagenTot(b, datum))[0];
  return { feestdag: volgende, actief: false };
}

export const receptenVoor = (recepten, feestdagId) => recepten.filter((r) => !feestdagId || r.feestdag === feestdagId);
