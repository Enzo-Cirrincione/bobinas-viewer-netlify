const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  try {
    const FLOW_URL   = process.env.FLOW_POST_DEV_URL;
    const CLIENT_KEY = process.env.CLIENT_KEY;

    if (!FLOW_URL || !CLIENT_KEY) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'CONFIG', message: 'Falta FLOW_POST_DEV_URL o CLIENT_KEY' }) };
    }

    let input = {};
    try { input = event.body ? JSON.parse(event.body) : {}; }
    catch {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'bad_request', message: 'Body no es JSON válido' }) };
    }

    // Normalizamos nombres que puedan venir del viewer
    const id       = input.id ?? input.ID ?? input.Id;
    const cant     = input.cantidad_devolucion ?? input.cantidad_devuelta ?? input.CANTIDAD_DEVOLUCION ?? input?.updates?.CANTIDAD_DEVOLUCION;
    const linea    = input.linea ?? input.LINEA ?? input?.updates?.LINEA;
    const usuario  = input.usuario ?? input.USUARIO ?? input?.updates?.USUARIO ?? 'netlify';
    const obs      = input.observacion ?? input.OBSERVACION ?? input?.updates?.OBSERVACION ?? '';

    if (!id || cant == null || !linea) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({
          error: 'bad_request',
          message: 'Faltan campos requeridos',
          required: ['id','cantidad_devolucion','linea'],
          got: { id, cant, linea, usuario, obs }
        })
      };
    }

    // Payload EXACTO que espera el Flow
    const payload = {
      id,
      cantidad_devolucion: Number(cant),  // 👈 nombre correcto
      linea,
      observacion: obs,
      usuario,
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



