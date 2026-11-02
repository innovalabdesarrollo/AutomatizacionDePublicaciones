/**
 * Pruebas unitarias estratégicas (mínimas) — núcleo auth / UPC / Shopify / Node.
 */
import { describe, it } from 'node:test';

import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { assertNodeSecure } from '../../../scripts/assert-node-secure.mjs';
import {
  validateEmail,
  validatePassword,
  hashPassword,
  verifyPassword
} from '../src/auth/password.js';
import { signToken, verifyToken, COOKIE_NAME } from '../src/auth/tokens.js';
import { isValidUpc } from '../src/routes/requests.js';
import { isShopifyConfigured, createDraftProduct } from '../src/services/shopify.js';

describe('Node runtime seguro', () => {
  it('acepta la versión actual (≥ parche Node2Shell)', () => {
    assert.doesNotThrow(() => assertNodeSecure(false));
  });
});

describe('Validación auth', () => {
  it('email: válido / inválido', () => {
    assert.equal(validateEmail('a@b.co'), null);
    assert.ok(validateEmail('malo'));
    assert.ok(validateEmail(''));
  });

  it('password: reglas mínimas', () => {
    assert.ok(validatePassword('corta1'));
    assert.ok(validatePassword('sinnumeros'));
    assert.equal(validatePassword('Clave1234'), null);
  });

  it('hash + verify bcrypt', async () => {
    const hash = await hashPassword('Clave1234');
    assert.ok(hash.startsWith('$2'));
    assert.equal(await verifyPassword('Clave1234', hash), true);
    assert.equal(await verifyPassword('otra', hash), false);
  });

  it('JWT sign/verify + cookie name', () => {
    assert.equal(COOKIE_NAME, 'tp_session');
    const token = signToken({ sub: 'u1', role: 'user' });
    const payload = verifyToken(token);
    assert.equal(payload.sub, 'u1');
    assert.equal(payload.role, 'user');
  });
});

describe('UPC', () => {
  it('acepta 8/12/13/14 dígitos y vacío', () => {
    assert.equal(isValidUpc(null), true);
    assert.equal(isValidUpc(''), true);
    assert.equal(isValidUpc('12345678'), true);
    assert.equal(isValidUpc('123456789012'), true);
    assert.equal(isValidUpc('1234567890123'), true);
    assert.equal(isValidUpc('12345678901234'), true);
  });

  it('rechaza longitudes inválidas', () => {
    assert.equal(isValidUpc('123'), false);
    assert.equal(isValidUpc('1234567890'), false);
    assert.equal(isValidUpc('abcdefghijkl'), false);
  });
});

describe('Shopify (sin credenciales)', () => {
  it('sin keys: no configurado y createDraft falla claro', async () => {
    const prevDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const prevToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    delete process.env.SHOPIFY_STORE_DOMAIN;
    delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    try {
      assert.equal(isShopifyConfigured(), false);
      await assert.rejects(
        () => createDraftProduct({ title: 'Demo' }),
        /SHOPIFY_STORE_DOMAIN|SHOPIFY_ADMIN_ACCESS_TOKEN/
      );
    } finally {
      if (prevDomain !== undefined) process.env.SHOPIFY_STORE_DOMAIN = prevDomain;
      else delete process.env.SHOPIFY_STORE_DOMAIN;
      if (prevToken !== undefined) process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = prevToken;
      else delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    }
  });
});

