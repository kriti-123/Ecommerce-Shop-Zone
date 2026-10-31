export interface StoreCategory {
  name: string;
  slug: string;
  image: string;
  alt: string;
  description: string;
  subcategories: string[];
  keywords: string[];
}

export const STORE_CATEGORIES: StoreCategory[] = [
  {
    name: 'Mobile',
    slug: 'mobile',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    alt: 'Smartphone',
    description: 'Phones, essentials and accessories for life on the go.',
    subcategories: ['Smartphones', 'Cases & covers', 'Screen protectors', 'Chargers'],
    keywords: [
      'mobile',
      'phone',
      'phones',
      'smartphone',
      'smartphones',
      'tablet',
      'iphone',
      'android',
    ],
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    image:
      'https://plus.unsplash.com/premium_photo-1679079456083-9f288e224e96?q=80&w=900&auto=format&fit=crop',
    alt: 'Home electronics and audio equipment',
    description: 'Explore computers, audio, cameras and everyday tech.',
    subcategories: ['Headphones', 'Cameras', 'Computers', 'Speakers'],
    keywords: [
      'electronic',
      'headphone',
      'laptop',
      'computer',
      'macbook',
      'mac book',
      'dell',
      'head phone',
      'camera',
      'watch',
      'speaker',
    ],
  },
  {
    name: 'Appliances',
    slug: 'appliances',
    image:
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80',
    alt: 'Modern home appliances',
    description: 'Make home life easier with appliances for every room.',
    subcategories: ['Kitchen appliances', 'Laundry', 'Vacuum cleaners', 'Air conditioning'],
    keywords: ['appliance', 'microwave', 'washing machine', 'vacuum', 'air conditioner'],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    image:
      'https://t3.ftcdn.net/jpg/02/95/71/62/360_F_295716240_1BbSXwbga7b2ghnN6RDTZq7rVb3GmaLe.jpg',
    alt: 'Fashion collection',
    description: 'Refresh your wardrobe with styles for every occasion.',
    subcategories: ['Women', 'Men', 'Shoes', 'Bags & accessories'],
    keywords: ['fashion', 'clothing', 'apparel', 'dress', 'shirt', 'shoes', 'bag'],
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
    alt: 'Makeup and beauty products',
    description: 'Find makeup, skincare and self-care essentials.',
    subcategories: ['Makeup', 'Skincare', 'Hair care', 'Fragrance'],
    keywords: ['beauty', 'makeup', 'skincare', 'cosmetic', 'fragrance', 'hair care'],
  },
  {
    name: 'Kitchen',
    slug: 'kitchen',
    image:
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    alt: 'Kitchen utensils and cookware',
    description: 'Cook, serve and organize with kitchen favorites.',
    subcategories: ['Cookware', 'Dining', 'Kitchen tools', 'Storage'],
    keywords: ['kitchen', 'cookware', 'pan', 'utensil', 'dining', 'storage'],
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    alt: 'Contemporary living room furniture',
    description: 'Make yourself at home with furniture and lighting.',
    subcategories: ['Living room', 'Bedroom', 'Office', 'Lighting'],
    keywords: ['furniture', 'sofa', 'chair', 'table', 'bedroom', 'lighting'],
  },
  {
    name: 'Travel',
    slug: 'travel',
    image:
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80',
    alt: 'Passenger airplane at sunset',
    description: 'Get ready for your next trip with travel essentials.',
    subcategories: ['Luggage', 'Travel accessories', 'Outdoor gear', 'Travel comfort'],
    keywords: ['travel', 'luggage', 'suitcase', 'backpack', 'outdoor'    ],
  },
  {
    name: 'Sports',
    slug: 'sports',
    image:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80',
    alt: 'Runner training on an outdoor track',
    description: 'Gear up for training, game day and outdoor adventures.',
    subcategories: ['Fitness', 'Team sports', 'Sportswear', 'Outdoor recreation'],
    keywords: [
      'sport',
      'sports',
      'fitness',
      'exercise',
      'gym',
      'running',
      'football',
      'basketball',
      'sportswear',
      'outdoor recreation',
    ],
  },
  {
    name: 'Grocery',
    slug: 'grocery',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=900&auto=format&fit=crop',
    alt: 'Fresh produce at a grocery market',
    description: 'Stock up on pantry staples, fresh picks and snacks.',
    subcategories: ['Fresh produce', 'Pantry', 'Snacks', 'Beverages'],
    keywords: ['grocery', 'produce', 'pantry', 'snack', 'beverage', 'food'],
  },
];
