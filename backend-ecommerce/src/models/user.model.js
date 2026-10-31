import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    addressLine1: { type: String, trim: true, maxlength: 160, default: '' },
    addressLine2: { type: String, trim: true, maxlength: 160, default: '' },
    city: { type: String, trim: true, maxlength: 80, default: '' },
    state: { type: String, trim: true, maxlength: 80, default: '' },
    postalCode: { type: String, trim: true, maxlength: 20, default: '' },
    country: { type: String, trim: true, maxlength: 80, default: '' },
    deliveryInstructions: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'seller'],
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 24,
      default: '',
    },
    address: {
      type: addressSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform(_document, result) {
    result.id = result._id.toString();
    delete result._id;
    delete result.__v;
    delete result.passwordHash;
    return result;
  },
});

export const User = mongoose.model('User', userSchema);
