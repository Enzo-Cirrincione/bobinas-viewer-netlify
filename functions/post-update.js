export default async (req, context) => {
  try {
    const FLOW_URL = process.env.FLOW_POST_UPDATE_URL; // URL del Flow POST_UPDATE
    const CLIENT_KEY = process.env.FLOW_CLIENT_KEY;    // tu client_key
    const KEY_AS = process.env.FLOW_KEY_AS || 'query'; // 'query' o 'header'
    const KEY_NAME = process.env.FLOW_KEY_NAME || 'client_key'; // nombre del parámetro o header

    if (!FLOW_URL || !CLIENT_KEY) {
      return new Response(JSON.stringify({ error: 'CONFIG', message: 'Falta FLOW_POST_UPDATE_URL o FLOW_CLIENT_KEY' }), { status: 500 });
    }

    const body = await req.json();

    // Construir URL con key si va por query
    const url = new URL(FLOW_URL);
    if (KEY_AS === 'query') url.searchParams.set(KEY_NAME, CLIENT_KEY);

    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    // Si la key va por header:
    if (KEY_AS === 'header') headers[KEY_NAME] = CLIENT_KEY;

    const r = await fetch(url.toString(), { method: 'POST', headers, body: JSON.stringify(body) });
    const text = await r.text();
    return new Response(text, { status: r.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'proxy_error', message: e?.message || 'Error' }), { status: 500 });
  }
};
