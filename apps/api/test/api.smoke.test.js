/**
 * Smoke API: health, auth y captura mínima contra Mongo real (apps/api/.env).
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE = `http://127.0.0.1:${process.env.PORT || 3003}`;
const email = `test_${Date.now()}@mvp.local`;
const password = 'Clave1234';

function jarFrom(res) {
  const raw = res.headers.getSetCookie?.() || [];
  return raw.map((c) => c.split(';')[0]).join('; ');
}

describe('API smoke', () => {
  let cookie = '';

  before(async () => {
    let health;
    try {
      health = await fetch(`${BASE}/api/health`);
    } catch {
      assert.fail(`API no responde en ${BASE}. Arranca: pnpm --filter api dev`);
    }
    assert.equal(health.status, 200);
  });

  it('GET /api/health', async () => {
    const res = await fetch(`${BASE}/api/health`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.service, 'automatizacion-publicaciones-api');
    assert.equal(typeof body.openaiConfigured, 'boolean');
    assert.equal(typeof body.shopifyConfigured, 'boolean');
  });

  it('GET /api/requests sin sesión → 401', async () => {
    const res = await fetch(`${BASE}/api/requests`);
    assert.equal(res.status, 401);
  });

  it('registro + me + listado + captura', async () => {
    const reg = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email, password })
    });
    if (reg.status !== 201) assert.fail(`register ${reg.status}: ${await reg.text()}`);
    cookie = jarFrom(reg);
    assert.ok(cookie.includes('tp_session'));

    const me = await fetch(`${BASE}/api/auth/me`, { headers: { Cookie: cookie } });
    assert.equal(me.status, 200);
    const meBody = await me.json();
    assert.equal(meBody.user.email, email);

    const list = await fetch(`${BASE}/api/requests`, { headers: { Cookie: cookie } });
    assert.equal(list.status, 200);

    const fd = new FormData();
    fd.set('inputName', 'Producto prueba unitaria');
    fd.set('upc', '123456789012');
    const create = await fetch(`${BASE}/api/requests`, {
      method: 'POST',
      headers: { Cookie: cookie },
      body: fd
    });
    if (create.status !== 201) assert.fail(`create ${create.status}: ${await create.text()}`);
    const created = await create.json();
    assert.ok(created.request?.id);
    assert.equal(created.request.stage, 'captura');
  });


  it('UPC inválido en captura → 400', async () => {
    const fd = new FormData();
    fd.set('inputName', 'X');
    fd.set('upc', '123');
    const res = await fetch(`${BASE}/api/requests`, {
      method: 'POST',
      headers: { Cookie: cookie },
      body: fd
    });
    assert.equal(res.status, 400);
  });
});
