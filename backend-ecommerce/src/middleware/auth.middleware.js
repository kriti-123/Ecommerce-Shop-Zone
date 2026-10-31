import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export async function requireAuth(request, response, next) {
  const authorization = request.get('authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';

  if (!token) {
    return response.status(401).json({ message: 'Authentication is required' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return response.status(401).json({ message: 'Invalid or expired authentication token' });
  }

  if (
    typeof payload !== 'object' ||
    typeof payload.sub !== 'string' ||
    (payload.role !== 'user' && payload.role !== 'seller')
  ) {
    return response.status(401).json({ message: 'Invalid authentication token' });
  }

  try {
    const user = await User.findById(payload.sub).select('_id name email role');
    if (!user || user.role !== payload.role) {
      return response.status(401).json({ message: 'Invalid authentication token' });
    }

    request.auth = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireRole(role) {
  return (request, response, next) => {
    if (request.auth?.role !== role) {
      return response.status(403).json({ message: 'You do not have permission to do this' });
    }
    return next();
  };
}
