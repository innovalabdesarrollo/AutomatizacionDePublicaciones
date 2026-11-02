import { getDb } from '../db.js';
import { COOKIE_NAME, verifyToken } from './tokens.js';

function extractToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.[COOKIE_NAME] || null;
}

export async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    const db = getDb();
    const user = await db.collection('users').findOne(
      { id: payload.sub, active: true },
      { projection: { passwordHash: 0 } }
    );

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...slugs) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!slugs.includes(req.user.role)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

export const requireAdmin = requireRole('admin');
