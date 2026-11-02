# Credenciales — Automatización de publicaciones

## Archivo operativo

**`apps/api/.env`** — único `.env` de la API.

```bash
cp .env.example apps/api/.env
```

---

## Pedir al cliente

### OpenAI
| Variable | Uso | Archivo |
| --- | --- | --- |
| `OPENAI_API_KEY` | Investigación / imágenes reales | **`apps/api/.env`** |
| `OPENAI_MODEL` | Opcional (`gpt-4o-mini`) | **`apps/api/.env`** |

**Guía:** → **[OPENAI-CLIENTE.md](./OPENAI-CLIENTE.md)**  
**Sin key:** modo **demo IA** (flujo completo con datos de ejemplo, marcados DEMO).  
**Costo:** solo con key real (tokens OpenAI). **Nunca** en el front.


### Shopify
| Variable | Uso |
| --- | --- |
| `SHOPIFY_STORE_DOMAIN` | ej. `tienda.myshopify.com` |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | token Admin API (`shpat_…`) secreto |
| `SHOPIFY_API_VERSION` | opcional |

**Guía completa (pasos, scopes, costos, mensaje listo):** → **[SHOPIFY-CLIENTE.md](./SHOPIFY-CLIENTE.md)**

**Costo Shopify de la conexión:** no hay cargo extra por Custom App + Admin API; solo su plan de tienda habitual.

---

## Lo pones tú (infra)

| Variable | Uso |
| --- | --- |
| `MONGODB_URI` | Atlas, DB `automatizacion_publicaciones` |
| `JWT_SECRET` | ≥32 chars aleatorios |
| `PORT` | local: `3003` |
| `CORS_ORIGIN` | URL del front en Vercel |
| `COOKIE_SECURE` | `true` en Vercel |
| `COOKIE_SAMESITE` | `none` en Vercel (web y API en dominios distintos) |
| `PUBLIC_API_URL` | en proyecto **web**: URL del API Vercel |

Deploy paso a paso: **[DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md)**

---

## Auth

- Registro/login email + password  
- Sin admin activo → nuevo registro = admin  
- Roles: `admin`, `user`
