import { DateTime } from "luxon";
function mezarSaatineGoreKalan(saat, zone, respawn){
  // Tümüyle 'zone' içinde hesapla; yerelden zone'a dönüşüm yapma
  const [h, m, s = 0] = saat.split(":").map(Number);
  const now = DateTime.now().setZone(zone);
  let tomb = now.set({ hour: h, minute: m, second: s, millisecond: 0 });
  if (tomb > now) tomb = tomb.minus({ days: 1 });
  const diff = now.diff(tomb, "seconds").seconds; // geçen süre (saniye)
  return Math.round(respawn - diff);
}
function ozelZamanaGoreKalan(dk,sn){
  return dk*60+sn;
}
if (typeof window !== "undefined") {
  window.mezarSaatineGoreKalan = mezarSaatineGoreKalan;
  window.ozelZamanaGoreKalan = ozelZamanaGoreKalan;
}

export { mezarSaatineGoreKalan, ozelZamanaGoreKalan };
