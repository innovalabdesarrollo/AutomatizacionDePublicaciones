# Qué pedir al cliente para conectar Shopify

Este MVP **solo crea productos en estado borrador (draft)**.  
**Nunca publica** el producto a la tienda visible. El equipo del cliente revisa y publica en Shopify Admin.

Archivo donde van las credenciales: **`apps/api/.env`** (solo servidor; nunca en el front).

---

## 1) Credenciales que debes pedir (obligatorias)

| Dato | Variable en `.env` | Ejemplo | ¿Es secreto? |
| --- | --- | --- | --- |
| Dominio de la tienda | `SHOPIFY_STORE_DOMAIN` | `technstore.myshopify.com` | No (público del admin) |
| Access token Admin API | `SHOPIFY_ADMIN_ACCESS_TOKEN` | `shpat_…` | **Sí — secreto** |
| Versión API (opcional) | `SHOPIFY_API_VERSION` | `2024-10` | No (default ok) |

### Cómo las obtiene el cliente (Custom App — gratis en su plan)

1. Entrar a **Shopify Admin** de su tienda.  
2. **Settings → Apps and sales channels → Develop apps** (o “Apps” → “Develop apps”).  
3. **Create an app** (ej. nombre: `TechnStore Publicaciones MVP`).  
4. **Configure Admin API scopes** y activar como mínimo:
   - `write_products`
   - `read_products`  
5. **Install app** en la tienda.  
6. Copiar el **Admin API access token** (`shpat_…`) **una sola vez** (Shopify no lo vuelve a mostrar completo).  
7. Enviar a Innovalab por canal seguro (no por chat público / no pegar en tickets abiertos):
   - Dominio: `xxx.myshopify.com`
   - Token: `shpat_…`

Tú (Innovalab) los pegas en `apps/api/.env` y reinicias la API.

---

## 2) ¿Le genera costos al cliente?

| Concepto | ¿Costo extra por esta integración? |
| --- | --- |
| Crear **Custom App** + Admin API token | **No** — incluido en su plan Shopify |
| Llamadas Admin API para crear borradores | **No** hay cobro por “API call” en el uso normal de Admin API de su tienda |
| Plan de Shopify (Basic / Shopify / Advanced…) | **Sí, pero ya lo paga** por tener tienda; esta app no inventa un cargo nuevo |
| Apps del App Store de terceros | **No aplica** — usamos Custom App propia, no una app de pago de terceros |
| Publicar producto / vender | Flujo normal de Shopify (comisiones de pasarela, etc.) — **fuera de este MVP** |

**Resumen para el cliente:**  
> “Necesitamos que creen una app privada (Custom App) en su Shopify y nos pasen el dominio y el token Admin con permiso de productos. No implica un cargo adicional de Shopify solo por conectarnos; usamos la API de su tienda para crear borradores.”

---

## 3) Seguridad (qué sí / qué no)

- El token **solo** vive en `apps/api/.env` (o variables del hosting de la API).  
- **No** va en Vercel del front, ni en el repo, ni en capturas.  
- Permisos mínimos: productos (`read_products`, `write_products`). No pedir acceso a órdenes, clientes, etc.  
- El sistema exige confirmación en UI y `{ "confirm": true }` en API.  
- Si el producto ya se envió como borrador, **no crea duplicado**.  
- Status forzado: `draft`.

---

## 4) Checklist de onboarding

- [ ] Cliente creó Custom App  
- [ ] Scopes: `write_products` + `read_products`  
- [ ] App instalada en la tienda  
- [ ] Entregó `SHOPIFY_STORE_DOMAIN`  
- [ ] Entregó `SHOPIFY_ADMIN_ACCESS_TOKEN` por canal seguro  
- [ ] Tú lo cargaste en `apps/api/.env`  
- [ ] Probar: ficha + SKU/stock → “Confirmar envío como borrador” → aparece en Shopify Admin como **Draft**

---

## 5) Mensaje listo para copiar al cliente

```
Hola,

Para conectar la herramienta de publicaciones con su Shopify necesitamos:

1) Dominio de la tienda (ej. mitienda.myshopify.com)
2) Un Access Token de Admin API de una Custom App

Pasos en Shopify Admin:
- Settings → Apps → Develop apps → Create an app
- Admin API scopes: write_products y read_products
- Install app → copiar Admin API access token (shpat_…)

Eso no genera un cargo extra de Shopify por la conexión; usa la API de su tienda.
La herramienta solo creará productos en BORRADOR para que su equipo revise
(SKU/stock/precio) antes de publicar.

Favor enviar dominio + token por un canal seguro (no por WhatsApp grupal abierto).
```
