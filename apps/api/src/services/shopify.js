/**
 * Shopify Admin API — solo crea productos en estado draft.
 * Credenciales: apps/api/.env (nunca en el front).
 * Ver SHOPIFY-CLIENTE.md
 */

function shopifyConfig() {
  const shopRaw = process.env.SHOPIFY_STORE_DOMAIN || '';
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-10';

  if (!shopRaw.trim() || !token.trim()) {
    throw new Error(
      'Faltan SHOPIFY_STORE_DOMAIN y/o SHOPIFY_ADMIN_ACCESS_TOKEN en apps/api/.env (pedir al cliente; ver SHOPIFY-CLIENTE.md).'
    );
  }

  const shop = shopRaw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '')
    .split('/')[0]
    .toLowerCase();

  // Evita hosts raros / inyección; dominio de tienda o *.myshopify.com
  if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/i.test(shop)) {
    throw new Error('SHOPIFY_STORE_DOMAIN inválido. Ej: mitienda.myshopify.com');
  }

  if (token.length < 20) {
    throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN parece inválido (muy corto).');
  }

  return { shop, token, apiVersion };
}

export function isShopifyConfigured() {
  return Boolean(
    process.env.SHOPIFY_STORE_DOMAIN?.trim() &&
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim()
  );
}

/**
 * Crea producto SIEMPRE como borrador (status: draft). Nunca published/active.
 */
export async function createDraftProduct({ title, description, brand, sku }) {
  const { shop, token, apiVersion } = shopifyConfig();

  if (!title || !String(title).trim()) {
    throw new Error('El título es obligatorio para crear el borrador en Shopify');
  }

  const product = {
    title: String(title).trim(),
    body_html: description || '',
    vendor: brand || undefined,
    status: 'draft', // forzado — no publicar
    published: false,
    variants: [
      {
        sku: sku || undefined,
        price: '0.00' // precio lo define el equipo en Shopify
      }
    ]
  };

  const res = await fetch(
    `https://${shop}/admin/api/${apiVersion}/products.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ product })
    }
  );

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 300) };
  }

  if (!res.ok) {
    // No incluir el token ni headers en el mensaje
    const msg = data?.errors
      ? JSON.stringify(data.errors)
      : text.replace(/shpat_[a-zA-Z0-9]+/g, '[token]').slice(0, 400);
    throw new Error(`Shopify error ${res.status}: ${msg}`);
  }

  const created = data.product;
  if (!created?.id) {
    throw new Error('Shopify no devolvió id de producto');
  }

  // Doble chequeo: si por alguna razón no quedó draft, avisar (no auto-arreglar a published)
  const status = created.status || 'draft';
  if (status !== 'draft') {
    throw new Error(
      `Shopify devolvió status "${status}" en lugar de draft. Revisa permisos/configuración de la app.`
    );
  }

  return {
    shopifyProductId: String(created.id),
    shopifyAdminUrl: `https://${shop}/admin/products/${created.id}`,
    status: 'draft'
  };
}
