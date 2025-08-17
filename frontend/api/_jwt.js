import jwt from 'jsonwebtoken';

export function signToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

export function verifyTokenFromRequest(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw new Error('NO_TOKEN');
  return jwt.verify(token, process.env.JWT_SECRET);
}
