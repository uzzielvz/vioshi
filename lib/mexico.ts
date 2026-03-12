export interface MexicoCPData {
  estado: string;
  municipio: string;
  colonias: string[];
}

// Lookup CP using the public SEPOMEX mirror — no API key required.
// Endpoint: api-sepomex.hckdrk.mx (community-maintained, free, no auth)
export async function lookupCP(cp: string): Promise<MexicoCPData | null> {
  if (cp.length !== 5 || !/^\d{5}$/.test(cp)) return null;

  try {
    const res = await fetch(
      `https://api-sepomex.hckdrk.mx/query/info_cp/${cp}?type=JSON`
    );
    if (!res.ok) return null;

    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) return null;

    const valid = json.filter((item: { error: boolean }) => !item.error);
    if (valid.length === 0) return null;

    return {
      estado: valid[0].response.nEstado,
      municipio: valid[0].response.municipio,
      colonias: valid.map((item: { response: { asentamiento: string } }) =>
        item.response.asentamiento
      ).sort(),
    };
  } catch {
    return null;
  }
}
