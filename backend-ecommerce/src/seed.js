import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { Product } from './models/product.model.js';
import { User } from './models/user.model.js';

async function ensureDemoUser({ name, email, role }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log(`Kept existing ${role} account: ${email}`);
    return existingUser;
  }

  const password = randomBytes(18).toString('base64url');
  const user = await User.create({
    name,
    email,
    role,
    passwordHash: await bcrypt.hash(password, 12),
  });

  console.log(`Created ${role} account: ${email}`);
  console.log(`Temporary demo password: ${password}`);
  return user;
}

const demoProducts = [
  {
    name: 'SonicWave Wireless Headphones',
    description: 'Comfortable over-ear headphones with rich, balanced sound.',
    price: 79.99,
    originalPrice: 99.99,
    isActive: true,
    stockQuantity: 18,
    category: 'Electronics',
    subcategory: 'Headphones',
    productUrl: 'http://localhost:3001/images/headphones.svg',
    color: 'Black',
  },
  {
    name: 'ActiveFlex Training Shoes',
    description: 'Lightweight everyday trainers for workouts and walks.',
    price: 64.5,
    originalPrice: 89.99,
    isActive: true,
    stockQuantity: 12,
    category: 'Sports',
    subcategory: 'Fitness',
    productUrl: 'http://localhost:3001/images/training-shoes.svg',
    color: 'Green',
  },
  {
    name: 'Everyday Canvas Backpack',
    description: 'A practical, roomy backpack for commuting and weekend trips.',
    price: 42,
    originalPrice: 55,
    isActive: true,
    stockQuantity: 6,
    category: 'Fashion',
    subcategory: 'Bags',
    productUrl: 'http://localhost:3001/images/backpack.svg',
    color: 'Olive',
  },
  {
    name: 'BrewMate Coffee Maker',
    description: 'Compact drip coffee maker with a reusable filter basket.',
    price: 55.25,
    originalPrice: 69.99,
    isActive: true,
    stockQuantity: 0,
    category: 'Home & Kitchen',
    subcategory: 'Kitchen Appliances',
    productUrl: 'http://localhost:3001/images/coffee-maker.svg',
    color: 'Black',
  },
];

try {
  await connectDatabase();

  const seller = await ensureDemoUser({
    name: 'ShopZone Demo Seller',
    email: 'demo.seller@shopzone.local',
    role: 'seller',
  });
  await ensureDemoUser({
    name: 'ShopZone Demo Customer',
    email: 'demo.customer@shopzone.local',
    role: 'user',
  });

  for (const product of demoProducts) {
    await Product.updateOne(
      { sellerId: seller._id, name: product.name },
      {
        $set: { ...product, seller: seller.name },
        $setOnInsert: { sellerId: seller._id },
      },
      { upsert: true, runValidators: true }
    );
  }

  console.log(`Seeded ${demoProducts.length} demo products.`);
} catch (error) {
  console.error('Demo data seeding failed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
