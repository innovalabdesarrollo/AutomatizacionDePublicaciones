import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'tp_session';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET debe existir en apps/api/.env y tener al menos 32 caracteres'
    );
  }
  return secret;
}

export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  });
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
}

export function setAuthCookie(res, token) {
  const secure = process.env.COOKIE_SECURE === 'true';
  // Cross-origin (web.vercel.app → api.vercel.app) requiere SameSite=None + Secure
  const sameSite = process.env.COOKIE_SAMESITE || (secure ? 'none' : 'lax');
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite,
    secure,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

export function clearAuthCookie(res) {
  const secure = process.env.COOKIE_SECURE === 'true';
  const sameSite = process.env.COOKIE_SAMESITE || (secure ? 'none' : 'lax');
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite,
    secure,
    path: '/'
  });
}

export { COOKIE_NAME };
