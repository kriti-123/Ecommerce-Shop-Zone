import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { CartItem } from '../models/cart-item.model.js';
import { Product } from '../models/product.model.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(1).max(5000),
  price: z.coerce.number().finite().min(0),
  originalPrice: z.number().finite().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  stockQuantity: z.coerce.number().int().min(0).max(100000),
  category: z.string().trim().min(1).max(80),
  subcategory: z.string().trim().max(80).optional().default(''),
  productUrl: z.string().min(1).max(1500000),
  color: z.string().trim().min(1).max(60),
}).strict();

function isValidProductImage(value) {
  if (/^data:image\/(?:jpeg|png|webp|gif|avif);base64,[a-z0-9+/]+=*$/i.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

router.get('/', async (request, response, next) => {
  try {
    const filter = {};
    const category = typeof request.query.category === 'string'
      ? request.query.category.trim()
      : '';
    const subcategory = typeof request.query.subcategory === 'string'
      ? request.query.subcategory.trim()
      : '';

    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
    if (subcategory) filter.subcategory = new RegExp(`^${escapeRegex(subcategory)}$`, 'i');

    const parsedLimit = Number.parseInt(String(request.query.limit ?? '50'), 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;
    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(limit);
    return response.json(products);
  } catch (error) {
    return next(error);
  }
});

router.get('/top-deals', async (_request, response, next) => {
  try {
    const products = await Product.aggregate([
      {
        $match: {
          $and: [
            { stockQuantity: { $gt: 0 } },
            { $or: [{ isActive: true }, { isActive: { $exists: false } }] },
            { originalPrice: { $type: 'number', $gt: 0 } },
            { $expr: { $gt: ['$originalPrice', '$price'] } },
          ],
        },
      },
      {
        $addFields: {
          discountPercentage: {
            $multiply: [
              {
                $divide: [
                  { $subtract: ['$originalPrice', '$price'] },
                  '$originalPrice',
                ],
              },
              100,
            ],
          },
        },
      },
      { $match: { discountPercentage: { $gte: 20 } } },
      { $sort: { discountPercentage: -1, updatedAt: -1 } },
      { $limit: 12 },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          originalPrice: 1,
          discountPercentage: 1,
          stockQuantity: 1,
          category: 1,
          subcategory: 1,
          productUrl: 1,
          seller: 1,
          color: 1,
          createdAt: 1,
          isActive: 1,
        },
      },
    ]);

    return response.json(
      products.map(({ _id, ...product }) => ({
        ...product,
        id: _id.toString(),
      }))
    );
  } catch (error) {
    return next(error);
  }
});

router.get('/mine', requireAuth, requireRole('seller'), async (request, response, next) => {
  try {
    const products = await Product.find({ sellerId: request.auth.id })
      .sort({ createdAt: -1 });
    return response.json(products);
  } catch (error) {
    return next(error);
  }
});

router.get('/:productId', async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.productId)) {
      return response.status(400).json({ message: 'Invalid product identifier' });
    }

    const product = await Product.findById(request.params.productId);
    if (!product) {
      return response.status(404).json({ message: 'Product not found' });
    }

    return response.json(product);
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, requireRole('seller'), async (request, response, next) => {
  try {
    const input = productSchema.parse(request.body);
    if (!isValidProductImage(input.productUrl)) {
      return response.status(400).json({
        message: 'Product image must be an HTTP(S) URL or a supported image data URL',
      });
    }

    const product = await Product.create({
      ...input,
      seller: request.auth.name,
      sellerId: request.auth.id,
    });
    return response.status(201).json(product);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:productId', requireAuth, requireRole('seller'), async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.productId)) {
      return response.status(400).json({ message: 'Invalid product identifier' });
    }

    const input = productSchema.partial().parse(request.body);
    if (Object.keys(input).length === 0) {
      return response.status(400).json({ message: 'Provide at least one product field to update' });
    }
    if (input.productUrl && !isValidProductImage(input.productUrl)) {
      return response.status(400).json({
        message: 'Product image must be an HTTP(S) URL or a supported image data URL',
      });
    }

    const product = await Product.findOne({
      _id: request.params.productId,
      sellerId: request.auth.id,
    });
    if (!product) {
      return response.status(404).json({ message: 'Product not found for this seller' });
    }

    if (
      input.price !== undefined &&
      input.price < product.price &&
      (input.originalPrice === null || input.originalPrice === undefined)
    ) {
      input.originalPrice = product.originalPrice ?? product.price;
    }

    product.set(input);
    await product.save();
    return response.json(product);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:productId', requireAuth, requireRole('seller'), async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.productId)) {
      return response.status(400).json({ message: 'Invalid product identifier' });
    }

    const product = await Product.findOneAndDelete({
      _id: request.params.productId,
      sellerId: request.auth.id,
    });
    if (!product) {
      return response.status(404).json({ message: 'Product not found for this seller' });
    }

    await CartItem.deleteMany({ productId: product._id });
    return response.status(204).end();
  } catch (error) {
    return next(error);
  }
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default router;
