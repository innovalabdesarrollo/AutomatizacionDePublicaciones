import { MongoClient } from 'mongodb';
import { v4 as uuid } from 'uuid';

let client;
let db;

const SYSTEM_ROLES = [
  {
    slug: 'admin',
    name: 'Administrador',
    description: 'Acceso total, incluyendo administración del sistema'
  },
  {
    slug: 'user',
    name: 'Usuario',
    description: 'Operador de publicaciones'
  }
];

async function ensureIndex(collection, keys, options = {}) {
  try {
    await db.collection(collection).createIndex(keys, options);
  } catch (err) {
    // índice ya existe con otra opción / carrera: continuar si no es crítico
    if (err?.code !== 85 && err?.code !== 86) {
      // 85 IndexOptionsConflict, 86 IndexKeySpecsConflict
      if (err?.code === 11000) {
        console.warn(`Índice ${collection}`, err.message);
        return;
      }
      throw err;
    }
  }
}

export async function connectDb(uri) {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();

  // Limpia basura de intentos previos (docs sin slug rompen unique)
  await db.collection('roles').deleteMany({
    $or: [{ slug: null }, { slug: { $exists: false } }, { slug: '' }]
  });

  await seedRoles();

  await Promise.all([
    ensureIndex('users', { email: 1 }, { unique: true }),
    ensureIndex('roles', { slug: 1 }, { unique: true }),
    ensureIndex('researchRequests', { createdAt: -1 }),
    ensureIndex('researchRequests', { status: 1 }),
    ensureIndex('products', { researchRequestId: 1 }),
    ensureIndex('publicationSheets', { productId: 1 }),
    ensureIndex('shopifyPublications', { productId: 1 })
  ]);

  return db;
}

async function seedRoles() {
  const now = new Date();
  for (const role of SYSTEM_ROLES) {
    await db.collection('roles').updateOne(
      { slug: role.slug },
      {
        $set: {
          name: role.name,
          description: role.description,
          system: true,
          updatedAt: now
        },
        $setOnInsert: {
          id: uuid(),
          slug: role.slug,
          createdAt: now
        }
      },
      { upsert: true }
    );
  }
}

export function getDb() {
  if (!db) throw new Error('DB no conectada');
  return db;
}
