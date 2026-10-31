import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { product } from '../data-type';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-seller-home',
  templateUrl: './seller-home.component.html',
})
export class SellerHomeComponent implements OnInit {
  productListArr: product[] = [];
  searchTerm = '';
  loading = true;
  loadError = '';
  deletingId: string | number | null = null;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  get filteredProducts(): product[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) {
      return this.productListArr;
    }

    return this.productListArr.filter((item) =>
      [item.name, item.category, item.subcategory, item.color]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }

  get totalStock(): number {
    return this.productListArr.reduce(
      (total, item) => total + (item.stockQuantity ?? 0),
      0
    );
  }

  get lowStockCount(): number {
    return this.productListArr.filter(
      (item) => (item.stockQuantity ?? 0) > 0 && (item.stockQuantity ?? 0) <= 5
    ).length;
  }

  get outOfStockCount(): number {
    return this.productListArr.filter(
      (item) => (item.stockQuantity ?? 0) === 0
    ).length;
  }

  discountPercentage(item: product): number | null {
    if (
      !item.originalPrice ||
      item.originalPrice <= item.price
    ) {
      return null;
    }

    return ((item.originalPrice - item.price) / item.originalPrice) * 100;
  }

  isTopDeal(item: product): boolean {
    const discount = this.discountPercentage(item);
    return (
      item.isActive !== false &&
      (item.stockQuantity ?? 0) > 0 &&
      discount !== null &&
      discount >= 20
    );
  }

  editProduct(item: product): void {
    this.router.navigate(['/seller-add-product'], {
      queryParams: { id: item.id },
    });
  }

  deleteProduct(item: product): void {
    if (
      this.deletingId !== null ||
      !window.confirm(`Delete "${item.name}"? This cannot be undone.`)
    ) {
      return;
    }

    this.deletingId = item.id;
    this.loadError = '';
    this.productService.deleteProductWithId(item.id).subscribe({
      next: () => {
        this.productListArr = this.productListArr.filter(
          (productItem) => productItem.id !== item.id
        );
        this.deletingId = null;
      },
      error: (error: HttpErrorResponse) => {
        this.loadError =
          error.error?.message || 'Could not delete the product. Please try again.';
        this.deletingId = null;
      },
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.loadError = '';
    this.productService.sellerProductList().subscribe({
      next: (products) => {
        this.productListArr = products;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loadError =
          error.error?.message || 'Could not load your products. Please try again.';
        this.loading = false;
      },
    });
  }
}
