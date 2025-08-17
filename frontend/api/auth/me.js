import { verifyTokenFromRequest } from '../_jwt.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const decoded = verifyTokenFromRequest(req);
    return res.status(200).json({ user: decoded });
  } catch (err) {
    const code = err.message === 'NO_TOKEN' ? 401 : 403;
    return res.status(code).json({ message: 'Unauthorized' });
  }
}
