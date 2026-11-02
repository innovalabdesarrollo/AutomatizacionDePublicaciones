import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getDb } from './db.js';
import { requireAuth } from './auth/middleware.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import requestsRouter from './routes/requests.js';

export function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN?.trim();
  app.use(
    cors({
      origin: corsOrigin || true,
      credentials: true
    })
  );
  app.use(express.json({ limit: '4mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    const openaiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());
    res.json({
      ok: true,
      service: 'automatizacion-publicaciones-api',
      openaiConfigured,
      /** Sin key: investigación usa datos DEMO (flujo visible para el cliente). */
      openaiDemo: !openaiConfigured,
      shopifyConfigured: Boolean(
        process.env.SHOPIFY_STORE_DOMAIN?.trim() &&
          process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim()
      )
    });
  });


  // Imágenes en Mongo (compatible con Vercel; sin disco local)
  app.get('/api/media/:id', requireAuth, async (req, res) => {
    try {
      const img = await getDb().collection('productImages').findOne({ id: req.params.id });
      if (!img?.dataBase64) {
        return res.status(404).json({ error: 'Imagen no encontrada' });
      }
      const buf = Buffer.from(img.dataBase64, 'base64');
      res.setHeader('Content-Type', img.mimeType || 'application/octet-stream');
      res.setHeader('Cache-Control', 'private, max-age=3600');
      res.send(buf);
    } catch (err) {
      res.status(500).json({ error: err.message || 'Error al servir imagen' });
    }
  });

  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/requests', requireAuth, requestsRouter);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Error interno' });
  });

  return app;
}
