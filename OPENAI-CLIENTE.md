# OpenAI — dónde va la API key y qué pedir al cliente

## ¿La necesitamos?

**Para producción / datos reales: sí.**  
**Para demo al cliente sin key: no hace falta todavía.**

Sin `OPENAI_API_KEY` el sistema entra en **modo demo IA**:
- “Iniciar / repetir investigación” **sí funciona**
- Genera identificación + ficha **de ejemplo** (marcadas como DEMO)
- El resto del flujo (editar ficha, SKU/stock, UI) se puede recorrer

Con la key pegada → misma pantalla, datos reales de OpenAI.

La integración está en `apps/api/src/services/ai.js`.

---

## Dónde va (importante)

| Archivo | ¿Ahí? |
| --- | --- |
| **`apps/api/.env`** | **SÍ — único lugar operativo** |
| `.env` (raíz del repo) | Solo referencia; la API **no** lo lee para arrancar |
| `apps/web/.env` | **NO** — nunca en el front |
| Código / Git | **NO** |

Variables:

```bash
# en apps/api/.env  ← AQUÍ
OPENAI_API_KEY=sk-proj-...     # secreto del cliente
OPENAI_MODEL=gpt-4o-mini       # opcional (default)
```

Tras pegar la key: **reiniciar la API** (`pnpm dev:api` o el proceso en `:3003`).

Comprobar (sin filtrar secretos):

```bash
curl -s http://localhost:3003/api/health
# con key:  "openaiConfigured": true, "openaiDemo": false
# sin key:  "openaiConfigured": false, "openaiDemo": true
```

---

## Qué pedirle al cliente

1. Cuenta en [platform.openai.com](https://platform.openai.com)  
2. **API key** (`sk-…` o `sk-proj-…`)  
3. (Opcional) modelo preferido; si no, usamos `gpt-4o-mini` (barato y con visión)

Enviar la key por **canal seguro**.

---

## Costos

Sí genera costo por uso (tokens). El cliente asume su cuenta/billing OpenAI.  
El modo demo **no** llama a OpenAI (costo $0).

---

## Mensaje listo para el cliente

> Para la investigación y generación de fichas usamos la API de OpenAI (visión + texto).  
> Mientras tanto la demo muestra el flujo con datos de ejemplo.  
> Cuando nos den una API key (`sk-…`), la pegamos solo en el servidor y la misma pantalla pasa a resultados reales.  
> El costo es el de su cuenta OpenAI según uso.
