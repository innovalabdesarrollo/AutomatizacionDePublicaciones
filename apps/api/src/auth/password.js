import bcrypt from 'bcryptjs';

const ROUNDS = 12;

export async function hashPassword(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function validatePassword(plain) {
  if (!plain || typeof plain !== 'string') return 'La contraseña es obligatoria';
  if (plain.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Za-z]/.test(plain) || !/[0-9]/.test(plain)) {
    return 'Debe incluir letras y números';
  }
  return null;
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'El correo es obligatorio';
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return 'Correo inválido';
  return null;
}
