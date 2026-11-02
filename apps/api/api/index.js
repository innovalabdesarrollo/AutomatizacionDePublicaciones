/**
 * Entrada serverless para Vercel.
 * Root Directory del proyecto Vercel: apps/api
 */
import dotenv from 'dotenv';
import { assertNodeSecure } from '../../../scripts/assert-node-secure.mjs';
import { connectDb } from '../src/db.js';
import { createApp } from '../src/app.js';

assertNodeSecure(true);
dotenv.config();


const app = createApp();

let ready;
async function ensureDb() {
  if (!ready) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Falta MONGODB_URI');
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('Falta JWT_SECRET (≥32 chars)');
    }
    ready = connectDb(uri);
  }
  await ready;
}

export default async function handler(req, res) {
  await ensureDb();
  return app(req, res);
}
