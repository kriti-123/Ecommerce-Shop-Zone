import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0.01,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    subcategory: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
    productUrl: {
      type: String,
      required: true,
      maxlength: 1500000,
    },
    seller: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
  },
  { timestamps: true }
);

productSchema.set('toJSON', {
  transform(_document, result) {
    result.id = result._id.toString();
    delete result._id;
    delete result.__v;
    delete result.sellerId;
    return result;
  },
});

export const Product = mongoose.model('Product', productSchema);
