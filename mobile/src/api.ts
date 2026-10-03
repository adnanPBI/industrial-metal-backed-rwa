const API = process.env.EXPO_PUBLIC_RC_API_URL ?? 'https://staging.reservechain.io/wp-json/reservechain/v1';
export async function getAssets() {
  const r = await fetch(`${API}/assets`, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('Unable to load asset programs');
  return r.json();
}
export async function getConfig() {
  const r = await fetch(`${API}/config`, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('Unable to load platform configuration');
  return r.json();
}
