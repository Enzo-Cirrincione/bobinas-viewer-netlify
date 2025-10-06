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
    const FLOW_URL   = process.env.FLOW_POST_DEV_URL;
    const CLIENT_KEY = process.env.CLIENT_KEY;

    if (!FLOW_URL || !CLIENT_KEY) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'CONFIG', message: 'Falta FLOW_POST_DEV_URL o CLIENT_KEY' }) };
    }

    const input = event.body ? JSON.parse(event.body) : {};

    const payload = {
      ...input,
      api_key: input.api_key || CLIENT_KEY,
      client_key: input.client_key || CLIENT_KEY
    };

    const resp = await fetch(FLOW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await resp.text();
    return { statusCode: resp.status, headers: CORS, body: text };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'proxy_error', message: e?.message || 'Error' }) };
  }
};


