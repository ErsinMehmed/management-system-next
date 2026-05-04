// Nominatim (OpenStreetMap) geocoder. Без API ключ. ToS: 1 заявка/сек, добавя
// User-Agent. Резултатът трябва да се кешира — каузерът кешира в ClientOrder.coords.

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function geocodeAddress(address, { signal } = {}) {
  if (!address || !address.trim()) return null;

  const url =
    `${NOMINATIM_URL}?format=json&limit=1&accept-language=bg` +
    `&q=${encodeURIComponent(address)}`;

  try {
    const res = await fetch(url, {
      signal,
      headers: {
        "User-Agent": "ManagementSystemNext/1.0 (internal management app)",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
