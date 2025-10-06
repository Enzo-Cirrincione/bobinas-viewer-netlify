const buildCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
});

module.exports.handler = async (event) => {
  const CORS = buildCorsHeaders();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  try {
    const FLOW_URL   = process.env.FLOW_POST_DEV_URL; // URL del Flow POST_DEVOLUCION
    const CLIENT_KEY = process.env.CLIENT_KEY;        // tu client_key (secreta)
    const KEY_AS     = process.env.FLOW_KEY_AS || 'query';
    const KEY_NAME   = process.env.FLOW_KEY_NAME || 'client_key';

    if (!FLOW_URL || !CLIENT_KEY) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'CONFIG', message: 'Falta FLOW_POST_DEV_URL o CLIENT_KEY' }) };
    }

    const body = event.body ? JSON.parse(event.body) : {};

    const url = new URL(FLOW_URL);
    if (KEY_AS === 'query') url.searchParams.set(KEY_NAME, CLIENT_KEY);

    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (KEY_AS === 'header') headers[KEY_NAME] = CLIENT_KEY;

    const resp = await fetch(url.toString(), { method: 'POST', headers, body: JSON.stringify(body) });
    const text = await resp.text();

    return { statusCode: resp.status, headers: CORS, body: text };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'proxy_error', message: e?.message || 'Error' }) };
  }
};

