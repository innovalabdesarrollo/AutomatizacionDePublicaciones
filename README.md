# Automatización de publicaciones (TechnStore) — MVP

Captura → investigación IA → ficha → SKU/stock → borrador Shopify.

## Auth

- `/login` y `/registro` (email + password)
- JWT en cookie httpOnly
- Sin admin activo → nuevo registro = **admin**; si ya hay → **user**
- Rutas de app y `/api/requests` protegidas
- `/admin` (solo admin): roles y usuarios

## Correr local

Requiere **Node 24.x** (≥24.22.1; ver `.nvmrc`). `pnpm` falla si la versión es insegura (`engine-strict`).

```bash
cp .env.example apps/api/.env   # o editar el existente
# MONGODB_URI + JWT_SECRET (≥32) obligatorios
pnpm i
pnpm check:node   # opcional; también corre solo en predev/prebuild
pnpm dev
```


- API: http://localhost:3003 (`PORT` en `apps/api/.env`)  
- Web: http://localhost:5173 (si está ocupado, Vite usa el siguiente libre; proxy → `:3003`)

## Tests

```bash
pnpm test       # unit/smoke API (API en :3003)
pnpm test:e2e   # Playwright (web :5199 + API :3003; reutiliza servidores si ya corren)
```

## Deploy demo Vercel

Ver **[DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md)** (2 proyectos: `apps/api` + `apps/web`).

Credenciales: `CREDENCIALES-CLIENTE.md` · OpenAI · Shopify.

