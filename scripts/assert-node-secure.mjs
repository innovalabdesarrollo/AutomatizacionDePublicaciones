#!/usr/bin/env node
/**
 * Bloquea Node vulnerable a Node2Shell (CVE-2026-111497) y el resto
 * del security release 21 oct 2026. Se ejecuta en predev/prebuild/prestart
 * y al arrancar la API (local + Vercel).
 *
 * Mínimos oficiales: 22.23.4 | 24.22.1 | 26.12.1
 */
const MIN = {
  22: [22, 23, 4],
  24: [24, 22, 1],
  26: [26, 12, 1]
};

function parse(v) {
  const m = String(v).replace(/^v/, '').split('.').map((n) => Number(n));
  return [m[0] || 0, m[1] || 0, m[2] || 0];
}

function gte(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return true;
}

export function assertNodeSecure(exitOnFail = true) {
  const current = parse(process.versions.node);
  const [major] = current;
  const min = MIN[major];

  let ok = false;
  let hint = 'Usa Node 24.22.1+ (recomendado), 22.23.4+ o 26.12.1+. Ver .nvmrc';

  if (min) {
    ok = gte(current, min);
    if (!ok) {
      hint = `Node ${major}.x vulnerable. Mínimo: ${min.join('.')} (Node2Shell CVE-2026-111497). Actual: v${process.versions.node}`;
    }
  } else {
    hint = `Node ${major}.x no soportado / sin parche Node2Shell. Actual: v${process.versions.node}. Usa 24.x (≥24.22.1).`;
  }

  if (!ok) {
    const msg = `[seguridad] ${hint}`;
    if (exitOnFail) {
      console.error(msg);
      process.exit(1);
    }
    throw new Error(msg);
  }

  return true;
}

const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith('assert-node-secure.mjs') ||
    process.argv[1].includes('assert-node-secure'));

if (isMain) {
  assertNodeSecure(true);
  console.log(`Node OK (seguro): v${process.versions.node}`);
}
