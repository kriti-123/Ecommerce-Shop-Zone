import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { CartItem } from '../models/cart-item.model.js';
import { Product } from '../models/product.model.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
const cartItemSchema = z.object({
  productId: z.string().refine(mongoose.isValidObjectId, 'Invalid product identifier'),
  quantity: z.coerce.number().int().min(1).max(10),
});

router.use(requireAuth, requireRole('user'));

router.get('/', async (request, response, next) => {
  try {
    const items = await CartItem.find({ userId: request.auth.id })
      .populate('productId')
      .sort({ updatedAt: -1 });
    return response.json(
      items
        .filter((item) => item.productId)
        .map((item) => ({
          ...item.productId.toJSON(),
          quantity: item.quantity,
        }))
    );
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const input = cartItemSchema.parse(request.body);
    const product = await Product.findById(input.productId);
    if (!product) {
      return response.status(404).json({ message: 'Product not found' });
    }
    const stockQuantity = product.stockQuantity ?? 0;
    if (stockQuantity < 1) {
      return response.status(409).json({ message: 'This product is out of stock' });
    }
    if (input.quantity > stockQuantity) {
      return response.status(409).json({
        message: `Only ${stockQuantity} item(s) are currently available`,
      });
    }

    const item = await CartItem.findOneAndUpdate(
      { userId: request.auth.id, productId: input.productId },
      { $set: { quantity: input.quantity } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return response.status(200).json({
      ...product.toJSON(),
      quantity: item.quantity,
    });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:productId', async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.productId)) {
      return response.status(400).json({ message: 'Invalid product identifier' });
    }

    await CartItem.deleteOne({
      userId: request.auth.id,
      productId: request.params.productId,
    });
    return response.status(204).end();
  } catch (error) {
    return next(error);
  }
});

export default router;
