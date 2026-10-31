import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/user.model.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  role: z.enum(['user', 'seller']),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
  role: z.enum(['user', 'seller']),
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  phone: z.union([
    z.literal(''),
    z.string().trim().regex(/^[+]?[\d\s().-]{7,24}$/),
  ]).optional().default(''),
  address: z.object({
    addressLine1: z.string().trim().max(160).optional().default(''),
    addressLine2: z.string().trim().max(160).optional().default(''),
    city: z.string().trim().max(80).optional().default(''),
    state: z.string().trim().max(80).optional().default(''),
    postalCode: z.string().trim().max(20).optional().default(''),
    country: z.string().trim().max(80).optional().default(''),
    deliveryInstructions: z.string().trim().max(500).optional().default(''),
  }),
});

function createToken(user) {
  return jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    }
  );
}

function authResponse(user) {
  return {
    token: createToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

function profileResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? '',
    address: {
      addressLine1: user.address?.addressLine1 ?? '',
      addressLine2: user.address?.addressLine2 ?? '',
      city: user.address?.city ?? '',
      state: user.address?.state ?? '',
      postalCode: user.address?.postalCode ?? '',
      country: user.address?.country ?? '',
      deliveryInstructions: user.address?.deliveryInstructions ?? '',
    },
  };
}

router.get('/profile', requireAuth, requireRole('user'), async (request, response, next) => {
  try {
    const user = await User.findById(request.auth.id).select(
      '_id name email role phone address'
    );
    if (!user) {
      return response.status(404).json({ message: 'Customer account not found' });
    }

    return response.json(profileResponse(user));
  } catch (error) {
    return next(error);
  }
});

router.patch('/profile', requireAuth, requireRole('user'), async (request, response, next) => {
  try {
    const input = profileSchema.parse(request.body);
    const user = await User.findByIdAndUpdate(
      request.auth.id,
      {
        $set: {
          name: input.name,
          email: input.email.toLowerCase(),
          phone: input.phone,
          address: input.address,
        },
      },
      { new: true, runValidators: true }
    ).select('_id name email role phone address');

    if (!user) {
      return response.status(404).json({ message: 'Customer account not found' });
    }

    return response.json(profileResponse(user));
  } catch (error) {
    return next(error);
  }
});

router.post('/register', async (request, response, next) => {
  try {
    const input = registrationSchema.parse(request.body);
    if (Buffer.byteLength(input.password, 'utf8') > 72) {
      return response.status(400).json({ message: 'Password must be at most 72 bytes' });
    }

    const email = input.email.toLowerCase();
    const existingUser = await User.exists({ email });
    if (existingUser) {
      return response.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name: input.name,
      email,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: input.role,
    });

    return response.status(201).json(authResponse(user));
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body);
    const user = await User.findOne({
      email: input.email.toLowerCase(),
      role: input.role,
    }).select('+passwordHash');

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      return response.status(401).json({ message: 'Email or password is incorrect' });
    }

    return response.json(authResponse(user));
  } catch (error) {
    return next(error);
  }
});

export default router;
