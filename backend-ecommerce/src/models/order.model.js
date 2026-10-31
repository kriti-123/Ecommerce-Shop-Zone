import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    productUrl: { type: String, required: true, maxlength: 1500000 },
    seller: { type: String, required: true, trim: true, maxlength: 80 },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    lineTotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
    cancelledAt: { type: Date, default: null },
  },
  { _id: false }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 24 },
    addressLine1: { type: String, required: true, trim: true, maxlength: 160 },
    addressLine2: { type: String, trim: true, maxlength: 160, default: '' },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    state: { type: String, required: true, trim: true, maxlength: 80 },
    postalCode: { type: String, required: true, trim: true, maxlength: 20 },
    country: { type: String, required: true, trim: true, maxlength: 80 },
    deliveryInstructions: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: { type: [orderItemSchema], required: true, validate: (items) => items.length > 0 },
    deliveryAddress: { type: deliveryAddressSchema, required: true },
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery'],
      required: true,
      default: 'cash_on_delivery',
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
      required: true,
    },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  transform(_document, result) {
    result.id = result._id.toString();
    delete result._id;
    delete result.__v;
    delete result.userId;
    return result;
  },
});

export const Order = mongoose.model('Order', orderSchema);
