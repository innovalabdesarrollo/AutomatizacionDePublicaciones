import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertNodeSecure } from '../../../scripts/assert-node-secure.mjs';
import { connectDb } from './db.js';
import { createApp } from './app.js';

assertNodeSecure(true);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });


const PORT = Number(process.env.PORT || 3003);

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Falta MONGODB_URI en apps/api/.env');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('Falta JWT_SECRET (≥32 chars) en apps/api/.env');
    process.exit(1);
  }

  await connectDb(uri);
  console.log('MongoDB conectado');

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`API en http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
