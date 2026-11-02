# Checklist MVP — Automatización de publicaciones

Marca con `[x]` al completar y verificar cada ítem.  
Orden sugerido de construcción (de arriba hacia abajo).

---

## Acceso y seguridad

- [x] **1. Registro** — email + password; validación mínima; hash bcrypt; guarda en DB `automatizacion_publicaciones`
  - Criterios: nombre ≥2, email válido, password ≥8 con letras y números; email único; cookie de sesión al crear; sin Google
- [x] **2. Login / logout** — JWT httpOnly; mensajes claros de error
  - Criterios: login ok/fail; cookie sesión; `/api/auth/me`; logout limpia cookie; UI `/login` + botón Salir
- [x] **3. Protección de rutas** — front y `/api/requests` requieren sesión
  - Criterios: API 401 sin cookie; front redirige a `/login`; `/admin` solo admin; login/registro públicos
- [x] **4. Roles `admin` y `user`** — seed de sistema en Mongo
  - Criterios: al conectar API se aseguran `admin`/`user` con `system:true`; slug único; visibles en `/api/admin/roles`
- [x] **5. Bootstrap admin** — si no hay admin activo, el registro lo asigna
  - Criterios: `adminCount === 0` → rol admin; si ya hay admin activo → user
- [x] **6. Módulo Administración** — solo admin: roles + usuarios
  - Criterios: `/admin` UI; API `/api/admin/*` con requireAdmin; listar/crear roles; listar/asignar/activar usuarios; user → 403

## Flujo de publicaciones

- [x] **7. Listado de solicitudes** — producto, fecha, etapa, estado
  - Criterios: `GET /api/requests` autenticado; UI `/` con producto/fecha/etapa/estado (+ shopify); vacío usable
- [x] **8. Captura de datos iniciales** — nombre, marca, modelo, UPC, notas (opcionales)
  - Criterios: UI `/nueva`; POST crea solicitud; basta nombre O upc O imagen; stage `captura`
- [x] **9. Validación UPC** — 8 / 12 / 13 / 14 dígitos
  - Criterios: front y API rechazan UPC inválido; longitudes 8/12/13/14 aceptadas
- [x] **10. Carga de imágenes** — formatos permitidos, preview, quitar
  - Criterios: JPG/PNG/WEBP/GIF; preview+quitar en `/nueva`; upload autenticado; formato inválido rechazado
- [x] **11. Iniciar investigación IA** — estados procesando / completada / fallida
  - Criterios: `POST /api/requests/:id/research`; UI iniciar; estados; error accionable si falta OpenAI
  - Nota: flujo OK; `completada` requiere `OPENAI_API_KEY` del cliente (aún no en `.env`)
- [x] **12. Resultado de identificación** — hallazgos, fuentes, discrepancias
  - Criterios: colección `identificationResults`; UI sección Identificación; hallazgos/discrepancias/fuentes
  - Nota: datos reales tras investigación exitosa (requiere `OPENAI_API_KEY`)
- [x] **13. Repetir investigación** — con datos corregidos
  - Criterios: editar entrada (`PATCH`); volver a `POST .../research`; UI Guardar + Iniciar/repetir
- [x] **14. Ficha de publicación editable** — título, descripción, specs no confirmados
  - Criterios: `publicationSheets`; `PATCH .../sheet`; UI editar+guardar; specs `confirmed===false` marcados
  - Nota: ficha se crea al completar investigación (requiere OpenAI para datos reales)
- [x] **15. Datos internos** — SKU + stock obligatorios (manual)
  - Criterios: `PUT .../internal`; SKU y stock validados; UI sección Datos internos; no los define la IA
- [x] **16. Envío Shopify borrador** — confirmación; sin auto-publish; sin duplicar
  - Criterios: `POST .../shopify` con confirm; status draft forzado; anti-duplicado; token solo en `.env`
  - Docs: `SHOPIFY-CLIENTE.md` (qué pedir, costos, scopes)
  - Nota: envío real pendiente de credenciales del cliente + ficha/SKU
- [x] **17. Consulta de estado** del proceso
  - Criterios: listado con producto/fecha/etapa/estado/shopify; detalle con status/stage/errores
- [x] **18. Reintento** de investigación o envío fallido
  - Criterios: `POST .../retry`; UI reintentar investigación/Shopify; conserva datos; anti-duplicado Shopify

## Infra

- [x] **19. MongoDB Atlas** — DB `automatizacion_publicaciones` aislada
  - Criterios: URI con nombre de DB; ping OK; login usa esa misma DB; no mezclar con otras DBs del cluster
- [x] **20. OpenAI** — credencial cliente
  - Criterios: servicio `ai.js` listo; key en **`apps/api/.env`** (`OPENAI_API_KEY`); docs `OPENAI-CLIENTE.md`
  - Nota: `openaiConfigured:false` hasta que el cliente entregue la key
- [x] **21. Shopify Admin API** — credencial cliente
  - Criterios: `shopify.js` draft-only; vars en **`apps/api/.env`**; docs `SHOPIFY-CLIENTE.md`
  - Listo para solo pegar: `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_ACCESS_TOKEN`
- [x] **22. UI responsive** — prioridad móvil
  - Criterios: viewport meta; Tailwind `sm:`; listado cards móvil / tabla desktop; formularios apilados en móvil
- [x] **23. Puertos por proyecto** — API `:3003`; front sin chocar
  - Criterios: `PORT=3003` en `apps/api/.env`; Vite proxy → 3003; `strictPort:false` si 5173 ocupado

## Fuera de alcance (no construir)

- [ ] ~~Auth Google~~
- [ ] ~~Envío de correo~~
- [ ] ~~Publicación automática / multi-canal~~

---

### Estado MVP

**Cerrado (1–23).** No hay siguiente ítem de producto en checklist/spec.  
Pendiente operativo (solo credenciales): `OPENAI_API_KEY` + Shopify en `apps/api/.env` · deploy Vercel → `DEPLOY-VERCEL.md`.  
Fuera de alcance: Google auth, correo, auto-publish / multi-canal.

### Notas

| # | Fecha | Nota |
| --- | --- | --- |
| 1 | 2026-11-02 | Registro verificado contra API `:3003` / DB `automatizacion_publicaciones` |
| 2 | 2026-11-02 | Login/logout/me verificados en `:3003`; UI `/login` OK |
| 3 | 2026-11-02 | Ya existía; verificado 401 API + guard layout + admin 403 |
| 4 | 2026-11-02 | Seed en `db.js`; roles system en DB + API admin OK |
| 5 | 2026-11-02 | Ya en `auth.js`; con admin activo el registro sale `user` |
| 6 | 2026-11-02 | Ya existía; admin 200 roles/users; user 403; UI `/admin` OK |
| 7 | 2026-11-02 | Ya existía; GET /api/requests 200 (lista vacía OK); home 200; 401 sin auth |
| 8 | 2026-11-02 | Ya existía; POST captura OK; vacío 400; UI `/nueva` 200 |
| 9 | 2026-11-02 | Ya existía; UPC `123`→400; UPC 12 dígitos→201 |
| 10 | 2026-11-02 | Ya existía; PNG OK + auth uploads; txt rechazado; UI preview/quitar |
| 11 | 2026-11-02 | Ya existía; endpoint+UI OK; sin OPENAI → error claro + status fallida |
| 12 | 2026-11-02 | Ya existía API+UI; añadido bloque Fuentes (mínimo); live data pendiente OpenAI |
| 13 | 2026-11-02 | Ya existía; PATCH datos OK + re-research; UI guardar/repetir |
| 14 | 2026-11-02 | Ya existía API+UI; sin ficha aún (investigación no completada sin OpenAI) |
| 15 | 2026-11-02 | Ya existía; sin SKU→400; UI SKU/stock; requiere producto/ficha previos |
| 16 | 2026-11-02 | Flujo ya existía; endurecido draft+validación; doc SHOPIFY-CLIENTE.md |
| 17 | 2026-11-02 | Ya existía; list+detalle con status/stage/fecha/shopify/errores |
| 18 | 2026-11-02 | Ya existía; POST /retry + botones UI; datos conservados |
| 19 | 2026-11-02 | Ya existía; ping OK; DB aislada; login/me intactos (sin tocar código) |
| 20 | 2026-11-02 | Integración ya existía; docs+placeholders en apps/api/.env; login OK |
| 21 | 2026-11-02 | Ya existía; placeholders listos en apps/api/.env; solo falta pegar creds |
| 22 | 2026-11-02 | Ya existía; viewport + breakpoints sm: en layout/listado/formularios |
| 23 | 2026-11-02 | Ya existía; API :3003; proxy web→3003; front puerto flexible |
