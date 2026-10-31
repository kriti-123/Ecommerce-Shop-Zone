import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CustomerOrder, DeliveryAddress, product } from '../data-type';
import { OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { ProfileService } from '../services/profile.service';

const EMPTY_ADDRESS: DeliveryAddress = {
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  deliveryInstructions: '',
};

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  readonly deliveryFee = 0;
  address: DeliveryAddress = { ...EMPTY_ADDRESS };
  cartItems: product[] = [];
  order: CustomerOrder | null = null;
  loading = true;
  placingOrder = false;
  updatingProductId: string | number | null = null;
  errorMessage = '';
  cartError = '';
  savedProfileNotice = '';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('data');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.address.fullName = user.name ?? '';
        this.address.email = user.email ?? '';
      } catch {
        this.errorMessage = 'Your account details could not be read. Please sign in again.';
      }
    }
    this.profileService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.address.fullName = profile.name;
          this.address.email = profile.email;
          this.address.phone = profile.phone;
          Object.assign(this.address, profile.address);
        },
        error: () => {
          this.savedProfileNotice =
            'We could not load your saved delivery details. You can still enter them below.';
        },
      });
    this.loadCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get subtotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.price * (item.quantity ?? 1),
      0
    );
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }

  updateQuantity(item: product, quantity: number): void {
    const availableStock = item.stockQuantity ?? 0;
    if (
      this.updatingProductId !== null ||
      quantity < 1 ||
      quantity > Math.min(10, availableStock)
    ) {
      return;
    }

    this.updatingProductId = item.id;
    this.cartError = '';
    this.productService
      .addToCart({ productId: String(item.id), quantity })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.cartItems = items;
          this.updatingProductId = null;
        },
        error: (error: HttpErrorResponse) => {
          this.cartError =
            error.error?.message || 'Could not update your cart. Please try again.';
          this.updatingProductId = null;
        },
      });
  }

  removeItem(item: product): void {
    if (this.updatingProductId !== null) {
      return;
    }

    this.updatingProductId = item.id;
    this.cartError = '';
    this.productService
      .removeFromCart(item.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.cartItems = items;
          this.updatingProductId = null;
        },
        error: (error: HttpErrorResponse) => {
          this.cartError =
            error.error?.message || 'Could not remove this item. Please try again.';
          this.updatingProductId = null;
        },
      });
  }

  placeOrder(): void {
    if (this.placingOrder || this.cartItems.length === 0) {
      return;
    }

    this.placingOrder = true;
    this.errorMessage = '';
    this.orderService
      .placeOrder(this.address)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.placingOrder = false;
          this.productService.getCart().subscribe({
            error: () => {
              this.cartError = 'Order placed, but the cart count could not be refreshed.';
            },
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage =
            error.error?.message || 'Could not place your order. Please try again.';
          this.placingOrder = false;
          this.loadCart();
        },
      });
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  private loadCart(): void {
    this.loading = true;
    this.cartError = '';
    this.productService
      .getCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.cartItems = items;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.cartError =
            error.error?.message || 'Could not load your cart. Please try again.';
          this.loading = false;
        },
      });
  }
}
