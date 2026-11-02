import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { requireAuth, requireAdmin } from '../auth/middleware.js';

const router = Router();
router.use(requireAuth, requireAdmin);

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
}

router.get('/roles', async (_req, res) => {
  const roles = await getDb()
    .collection('roles')
    .find({})
    .project({ _id: 0 })
    .sort({ system: -1, name: 1 })
    .toArray();
  res.json(roles);
});

router.post('/roles', async (req, res) => {
  try {
    const { name, description, slug: rawSlug } = req.body || {};
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: 'Nombre de rol obligatorio' });
    }

    const slug = slugify(rawSlug || name);
    if (!slug) return res.status(400).json({ error: 'Slug inválido' });

    const db = getDb();
    const exists = await db.collection('roles').findOne({ slug });
    if (exists) {
      return res.status(409).json({ error: `Ya existe el rol "${slug}"` });
    }

    const now = new Date();
    const role = {
      id: uuid(),
      slug,
      name: String(name).trim(),
      description: description?.trim() || '',
      system: false,
      createdAt: now,
      updatedAt: now
    };
    await db.collection('roles').insertOne(role);
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al crear rol' });
  }
});

router.patch('/roles/:id', async (req, res) => {
  try {
    const db = getDb();
    const role = await db.collection('roles').findOne({ id: req.params.id });
    if (!role) return res.status(404).json({ error: 'Rol no encontrado' });

    const { name, description } = req.body || {};
    const $set = { updatedAt: new Date() };
    if (name !== undefined) {
      if (String(name).trim().length < 2) {
        return res.status(400).json({ error: 'Nombre inválido' });
      }
      $set.name = String(name).trim();
    }
    if (description !== undefined) $set.description = String(description).trim();

    if (role.system && req.body?.slug) {
      return res.status(400).json({ error: 'No se puede cambiar el slug de un rol de sistema' });
    }

    await db.collection('roles').updateOne({ id: role.id }, { $set });
    res.json(await db.collection('roles').findOne({ id: role.id }, { projection: { _id: 0 } }));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al actualizar rol' });
  }
});

router.delete('/roles/:id', async (req, res) => {
  try {
    const db = getDb();
    const role = await db.collection('roles').findOne({ id: req.params.id });
    if (!role) return res.status(404).json({ error: 'Rol no encontrado' });
    if (role.system) {
      return res.status(400).json({ error: 'No se pueden eliminar roles de sistema (admin/user)' });
    }

    const inUse = await db.collection('users').countDocuments({ role: role.slug });
    if (inUse > 0) {
      return res.status(400).json({
        error: `Hay ${inUse} usuario(s) con este rol. Reasígnarlos antes de eliminar.`
      });
    }

    await db.collection('roles').deleteOne({ id: role.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al eliminar rol' });
  }
});

router.get('/users', async (_req, res) => {
  const users = await getDb()
    .collection('users')
    .find({})
    .project({ _id: 0, passwordHash: 0 })
    .sort({ createdAt: -1 })
    .toArray();
  res.json(users);
});

router.patch('/users/:id', async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { role, active, name } = req.body || {};
    const $set = { updatedAt: new Date() };

    if (role !== undefined) {
      const roleDoc = await db.collection('roles').findOne({ slug: role });
      if (!roleDoc) return res.status(400).json({ error: 'Rol inexistente' });
      if (user.id === req.user.id && role !== 'admin') {
        return res.status(400).json({ error: 'No puedes quitarte el rol admin a ti mismo' });
      }
      $set.role = role;
    }

    if (active !== undefined) {
      if (user.id === req.user.id && active === false) {
        return res.status(400).json({ error: 'No puedes desactivarte a ti mismo' });
      }
      $set.active = Boolean(active);
    }

    if (name !== undefined) {
      if (String(name).trim().length < 2) {
        return res.status(400).json({ error: 'Nombre inválido' });
      }
      $set.name = String(name).trim();
    }

    await db.collection('users').updateOne({ id: user.id }, { $set });
    const updated = await db.collection('users').findOne(
      { id: user.id },
      { projection: { _id: 0, passwordHash: 0 } }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al actualizar usuario' });
  }
});

export default router;
