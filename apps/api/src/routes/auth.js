import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  validateEmail
} from '../auth/password.js';
import {
  signToken,
  setAuthCookie,
  clearAuthCookie
} from '../auth/tokens.js';
import { requireAuth } from '../auth/middleware.js';

const router = Router();

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ error: emailErr });
    const passErr = validatePassword(password);
    if (passErr) return res.status(400).json({ error: passErr });
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: 'Nombre obligatorio (mín. 2 caracteres)' });
    }

    const db = getDb();
    const normalized = String(email).trim().toLowerCase();
    const exists = await db.collection('users').findOne({ email: normalized });
    if (exists) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }

    // Rol por defecto user; admin solo si aún no hay ninguno activo (bootstrap).
    const adminCount = await db.collection('users').countDocuments({ role: 'admin', active: true });
    const role = adminCount === 0 ? 'admin' : 'user';

    const now = new Date();
    const user = {
      id: uuid(),
      email: normalized,
      name: String(name).trim(),
      passwordHash: await hashPassword(password),
      role,
      active: true,
      createdAt: now,
      updatedAt: now
    };

    await db.collection('users').insertOne(user);
    const token = signToken({ sub: user.id, role: user.role });
    setAuthCookie(res, token);

    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al registrar' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ error: emailErr });
    if (!password) return res.status(400).json({ error: 'Contraseña obligatoria' });

    const db = getDb();
    const user = await db.collection('users').findOne({
      email: String(email).trim().toLowerCase()
    });

    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    if (!user.active) {
      return res.status(403).json({ error: 'Cuenta desactivada' });
    }

    const token = signToken({ sub: user.id, role: user.role });
    setAuthCookie(res, token);
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al iniciar sesión' });
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
