import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Subject, catchError, switchMap, takeUntil } from 'rxjs';
import { cart, product } from '../data-type';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: product | undefined;
  productQty = 1;
  removeCart = false;
  loading = true;
  loadError = false;
  cartRequestInProgress = false;
  cartMessage = '';
  cartError = '';
  imageZoomActive = false;
  zoomTransformOrigin = '50% 50%';
  largeImageOpen = false;
  largeImageZoomed = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activeRoute.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('productId');
          this.product = undefined;
          this.productQty = 1;
          this.imageZoomActive = false;
          this.largeImageOpen = false;
          this.largeImageZoomed = false;
          this.loading = !!id;
          this.loadError = false;
          this.cartMessage = '';
          this.cartError = '';

          if (!id) {
            return EMPTY;
          }

          return this.productService.getProduct(id).pipe(
            catchError(() => {
              this.loading = false;
              this.loadError = true;
              return EMPTY;
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((result) => {
        this.product = result;
        this.loading = false;
        this.updateCartState(result.id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateImageZoom(event: MouseEvent): void {
    const imageBounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - imageBounds.left) / imageBounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - imageBounds.top) / imageBounds.height));
    this.zoomTransformOrigin = `${x * 100}% ${y * 100}%`;
  }

  openLargeImage(): void {
    this.largeImageOpen = true;
    this.largeImageZoomed = false;
  }

  closeLargeImage(): void {
    this.largeImageOpen = false;
    this.largeImageZoomed = false;
  }

  @HostListener('document:keydown.escape')
  closeLargeImageOnEscape(): void {
    this.closeLargeImage();
  }

  handleQuantity(operation: 'inc' | 'dec'): void {
    const availableStock = this.product?.stockQuantity ?? 0;
    if (
      operation === 'inc' &&
      this.productQty < Math.min(10, availableStock)
    ) {
      this.productQty += 1;
    } else if (operation === 'dec' && this.productQty > 1) {
      this.productQty -= 1;
    }
  }

  addToCart(): void {
    if (
      !this.product ||
      this.cartRequestInProgress ||
      (this.product.stockQuantity ?? 0) < 1
    ) {
      return;
    }

    this.cartMessage = '';
    this.cartError = '';
    if (!this.isSignedInCustomer()) {
      this.cartError = 'Sign in with a customer account to add products to your cart.';
      this.router.navigate(['/userAuth'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    const cartData: cart = {
      productId: String(this.product.id),
      quantity: this.productQty,
    };

    this.cartRequestInProgress = true;
    this.productService.addToCart(cartData).subscribe({
      next: () => {
        this.cartMessage = 'Added to your cart.';
        this.removeCart = true;
        this.cartRequestInProgress = false;
      },
      error: () => {
        this.cartError = 'Could not add this item to your cart. Please try again.';
        this.cartRequestInProgress = false;
      },
    });
  }

  removeToCart(id: string | number): void {
    if (!this.isSignedInCustomer()) {
      this.removeCart = false;
      this.router.navigate(['/userAuth'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    if (localStorage.getItem('authToken')) {
      this.productService.removeFromCart(id).subscribe({
        next: () => {
          this.removeCart = false;
          this.cartMessage = 'Removed from your cart.';
          this.cartError = '';
        },
        error: () => {
          this.cartError = 'Could not remove this item from your cart. Please try again.';
        },
      });
      return;
    }

    this.productService.removeItemFromCart(id);
    this.removeCart = false;
    this.cartMessage = 'Removed from your cart.';
    this.cartError = '';
  }

  private updateCartState(id: string | number): void {
    if (this.isSignedInCustomer()) {
      this.productService.getCart().subscribe({
        next: (items) => {
          this.removeCart = items.some(
            (item) => String(item.id) === String(id)
          );
        },
        error: () => {
          this.cartError = 'Could not load your cart. Please try again.';
        },
      });
      return;
    }

    this.removeCart = false;
  }

  private isSignedInCustomer(): boolean {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('data');
    if (!token || !user) {
      return false;
    }

    try {
      return JSON.parse(user).role === 'user';
    } catch {
      return false;
    }
  }
}
