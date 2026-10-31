import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { CartItem } from '../models/cart-item.model.js';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().regex(/^[+]?[\d\s().-]{7,24}$/),
  addressLine1: z.string().trim().min(4).max(160),
  addressLine2: z.string().trim().max(160).optional().default(''),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(80),
  deliveryInstructions: z.string().trim().max(500).optional().default(''),
});

router.use(requireAuth, requireRole('user'));

router.get('/', async (request, response, next) => {
  try {
    const orders = await Order.find({ userId: request.auth.id }).sort({
      createdAt: -1,
    });
    return response.json(orders);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (request, response, next) => {
  let stockClaims = [];
  let savedCartItems = [];

  try {
    const deliveryAddress = checkoutSchema.parse(request.body);
    const cartItems = await CartItem.find({ userId: request.auth.id }).populate('productId');
    if (cartItems.length === 0) {
      return response.status(400).json({ message: 'Your cart is empty' });
    }

    const missingProduct = cartItems.find((item) => !item.productId);
    if (missingProduct) {
      return response.status(409).json({
        message: 'A product in your cart is no longer available. Refresh your cart and try again.',
      });
    }

    const items = [];
    for (const cartItem of cartItems) {
      const product = cartItem.productId;
      const quantity = cartItem.quantity;
      const claimedProduct = await Product.findOneAndUpdate(
        { _id: product._id, stockQuantity: { $gte: quantity } },
        { $inc: { stockQuantity: -quantity } },
        { new: true }
      );

      if (!claimedProduct) {
        await restoreStock(stockClaims);
        stockClaims = [];
        return response.status(409).json({
          message: `${product.name} no longer has enough stock. Please update your cart.`,
        });
      }

      stockClaims.push({ productId: product._id, quantity });
      items.push({
        productId: product._id,
        name: product.name,
        productUrl: product.productUrl,
        seller: product.seller,
        unitPrice: product.price,
        quantity,
        lineTotal: roundMoney(product.price * quantity),
      });
    }

    const subtotal = roundMoney(
      items.reduce((total, item) => total + item.lineTotal, 0)
    );
    const deliveryFee = 0;
    const order = new Order({
      userId: request.auth.id,
      items,
      deliveryAddress,
      paymentMethod: 'cash_on_delivery',
      subtotal,
      deliveryFee,
      total: roundMoney(subtotal + deliveryFee),
    });

    savedCartItems = cartItems.map((item) => ({
      userId: item.userId,
      productId: item.productId._id,
      quantity: item.quantity,
    }));
    await CartItem.deleteMany({ userId: request.auth.id });
    await order.save();

    stockClaims = [];
    savedCartItems = [];
    return response.status(201).json(order);
  } catch (error) {
    await restoreStock(stockClaims);
    await restoreCart(request.auth.id, savedCartItems);
    return next(error);
  }
});

router.patch('/:orderId/items/:productId/cancel', async (request, response, next) => {
  try {
    const { orderId, productId } = request.params;
    if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(productId)) {
      return response.status(400).json({ message: 'Invalid order or product identifier' });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        userId: request.auth.id,
        status: { $in: ['placed', 'processing'] },
        items: {
          $elemMatch: {
            productId: new mongoose.Types.ObjectId(productId),
            status: { $ne: 'cancelled' },
          },
        },
      },
      [
        {
          $set: {
            items: {
              $map: {
                input: '$items',
                as: 'item',
                in: {
                  $cond: [
                    {
                      $eq: [
                        '$$item.productId',
                        new mongoose.Types.ObjectId(productId),
                      ],
                    },
                    {
                      $mergeObjects: [
                        '$$item',
                        { status: 'cancelled', cancelledAt: '$$NOW' },
                      ],
                    },
                    '$$item',
                  ],
                },
              },
            },
            updatedAt: '$$NOW',
          },
        },
        {
          $set: {
            subtotal: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$items',
                      as: 'item',
                      cond: { $ne: ['$$item.status', 'cancelled'] },
                    },
                  },
                  as: 'item',
                  in: '$$item.lineTotal',
                },
              },
            },
            status: {
              $cond: [
                {
                  $eq: [
                    {
                      $size: {
                        $filter: {
                          input: '$items',
                          as: 'item',
                          cond: { $ne: ['$$item.status', 'cancelled'] },
                        },
                      },
                    },
                    0,
                  ],
                },
                'cancelled',
                '$status',
              ],
            },
          },
        },
        {
          $set: {
            total: { $add: ['$subtotal', '$deliveryFee'] },
          },
        },
      ],
      { new: true }
    );

    if (!order) {
      const existingOrder = await Order.findOne({
        _id: orderId,
        userId: request.auth.id,
      }).select('_id status items.productId items.status');
      if (!existingOrder) {
        return response.status(404).json({ message: 'Order not found' });
      }

      return response.status(409).json({
        message:
          existingOrder.status !== 'placed' && existingOrder.status !== 'processing'
            ? 'Items can only be cancelled before the order is shipped'
            : 'This item is already cancelled or is not part of this order',
      });
    }

    const cancelledItem = order.items.find(
      (item) => item.productId.toString() === productId
    );
    if (!cancelledItem) {
      return response.status(409).json({ message: 'This item could not be cancelled' });
    }

    try {
      await Product.updateOne(
        { _id: cancelledItem.productId },
        { $inc: { stockQuantity: cancelledItem.quantity } }
      );
    } catch (error) {
      console.error(`Could not restore stock for cancelled item ${productId}:`, error);
      return response.status(500).json({
        message: 'The item cancellation was saved, but inventory could not be updated. Contact support.',
      });
    }

    return response.json(order);
  } catch (error) {
    return next(error);
  }
});

router.get('/:orderId', async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.orderId)) {
      return response.status(400).json({ message: 'Invalid order identifier' });
    }

    const order = await Order.findOne({
      _id: request.params.orderId,
      userId: request.auth.id,
    });
    if (!order) {
      return response.status(404).json({ message: 'Order not found' });
    }

    return response.json(order);
  } catch (error) {
    return next(error);
  }
});

async function restoreStock(productIds) {
  for (const claim of productIds) {
    try {
      await Product.updateOne(
        { _id: claim.productId },
        { $inc: { stockQuantity: claim.quantity } }
      );
    } catch (error) {
      console.error(
        `Could not restore product stock for ${claim.productId}:`,
        error
      );
    }
  }
}

async function restoreCart(userId, items) {
  for (const item of items) {
    try {
      await CartItem.updateOne(
        { userId, productId: item.productId },
        { $set: { quantity: item.quantity } },
        { upsert: true, runValidators: true }
      );
    } catch (error) {
      console.error(`Could not restore cart item ${item.productId}:`, error);
    }
  }
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export default router;
