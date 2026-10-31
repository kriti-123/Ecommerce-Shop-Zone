export interface signUp {
  name: string;
  email: string;
  password: string;
}
export interface login {
  email: String;
  password: String;
}

export interface product {
  name: string;
  price: number;
  category: string;
  subcategory?: string;
  productUrl: string;
  description: string;
  seller: string;
  color: string;
  id: string | number;
  quantity?: number;
  stockQuantity?: number;
  originalPrice?: number | null;
  discountPercentage?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface ProductDraft {
  name: string;
  price: number;
  category: string;
  subcategory: string;
  productUrl: string;
  description: string;
  color: string;
  stockQuantity: number;
  originalPrice?: number | null;
  isActive?: boolean;
}
export interface cart {
  productId: string;
  quantity: number;
}

export interface DeliveryAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryInstructions: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  role: 'user';
  phone: string;
  address: Omit<DeliveryAddress, 'fullName' | 'email' | 'phone'>;
}

export interface OrderItem {
  productId: string;
  name: string;
  productUrl: string;
  seller: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  status?: 'active' | 'cancelled';
  cancelledAt?: string | null;
}

export interface CustomerOrder {
  id: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'cash_on_delivery';
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export type OrderTrackingStatus =
  | 'placed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'seller';
  };
}

export interface priceSummary {
  price: number;
  discount: number;
  tax: number;
  delivery: number;
  total: number;
}

export interface order {
  email: string;
  address: string;
  contact: string;
  totalPrice: number;
  userId: string;
  id: number | undefined;
}
