# Deploy demo en Vercel (monorepo)

Un solo repo Git → **dos proyectos** en Vercel (recomendado):

| Proyecto Vercel | Root Directory | URL ejemplo |
| --- | --- | --- |
| **API** | `apps/api` | `https://auto-pub-api.vercel.app` |
| **Web** | `apps/web` | `https://auto-pub-web.vercel.app` |

Framework detectado: Node (API) / SvelteKit (Web).  
Install: los `vercel.json` de cada app ya apuntan a `pnpm` desde la raíz del monorepo.

**Node (automático — Node2Shell CVE-2026-111497):** el repo fija `"engines": { "node": "24.x" }` en raíz, `apps/api` y `apps/web`.  
Vercel **ignora** el dropdown si choca con `engines` y usa **24.x**; los patches de seguridad los aplica Vercel solos.  
Además: `.nvmrc` / `.node-version` = `24.22.2`, `engine-strict=true`, guard en arranque API + `predev`/`prebuild` (falla si Node < 24.22.1 / 22.23.4 / 26.12.1).  
No hace falta elegir versión a mano en el dashboard.




---

## 1) Proyecto API (`apps/api`)

1. Vercel → Add New Project → mismo repo.  
2. **Root Directory:** `apps/api`  
3. Variables de entorno (Production):

| Variable | Valor |
| --- | --- |
| `MONGODB_URI` | URI Atlas con DB `automatizacion_publicaciones` |
| `JWT_SECRET` | ≥32 chars aleatorios |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | URL exacta del front, ej. `https://auto-pub-web.vercel.app` |
| `COOKIE_SECURE` | `true` |
| `COOKIE_SAMESITE` | `none` |
| `OPENAI_API_KEY` | (cuando el cliente la dé) |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `SHOPIFY_STORE_DOMAIN` | (cuando el cliente la dé) |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | (cuando el cliente la dé) |
| `SHOPIFY_API_VERSION` | `2024-10` |

4. Deploy → copia la URL del API.

Health: `https://TU-API.vercel.app/api/health`

---

## 2) Proyecto Web (`apps/web`)

1. Add New Project → mismo repo.  
2. **Root Directory:** `apps/web`  
3. Variables:

| Variable | Valor |
| --- | --- |
| `PUBLIC_API_URL` | URL del API **sin** slash final, ej. `https://auto-pub-api.vercel.app` |

4. Deploy.

---

## 3) Orden recomendado

1. Deploy API  
2. Anotar URL API  
3. Deploy Web con `PUBLIC_API_URL`  
4. Si cambias URL del web, actualiza `CORS_ORIGIN` en API y redeploy API  

---

## 4) Demo sin OpenAI/Shopify

Funciona: login, registro, admin, captura, listados.  
No funciona hasta keys: investigación IA y envío Shopify.

---

## 5) Local (sin cambios de flujo)

```bash
# apps/api/.env  → PORT=3003, etc.
pnpm dev:api
pnpm dev:web   # proxy → :3003; PUBLIC_API_URL vacío
```

---

## Notas técnicas

- Imágenes se guardan en **MongoDB** (base64), no en disco → compatible con Vercel.  
- Límite demo: ~4 MB por imagen.  
- Cookie cross-site: `COOKIE_SECURE=true` + `COOKIE_SAMESITE=none` + `CORS_ORIGIN` del front.  
- Investigación IA: función API con `maxDuration: 60` (plan Hobby).
