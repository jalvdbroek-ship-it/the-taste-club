// Leeftijdspoort: een zelfverklaring per sessie. Dit is GEEN echte leeftijdsverificatie.
export const AGE_KEY = "tc.leeftijd18";
export const isAdultConfirmed = (storage) => { try { return storage.getItem(AGE_KEY) === "ja"; } catch { return false; } };
export const confirmAdult = (storage) => { try { storage.setItem(AGE_KEY, "ja"); return true; } catch { return false; } };
export const resetAdult = (storage) => { try { storage.removeItem(AGE_KEY); } catch { /* geen opslag beschikbaar */ } };
