import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDraft, product } from '../data-type';
import { STORE_CATEGORIES } from '../category/category-data';
import { ProductService } from '../services/product.service';

const EMPTY_PRODUCT: ProductDraft = {
  name: '',
  price: 0,
  category: '',
  subcategory: '',
  productUrl: '',
  description: '',
  color: '',
  stockQuantity: 0,
  originalPrice: null,
  isActive: true,
};

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent implements OnInit {
  categories = STORE_CATEGORIES;
  productDraft: ProductDraft = { ...EMPTY_PRODUCT };
  editingId: string | null = null;
  loadingProduct = false;
  saving = false;
  errorMessage = '';
  imagePreview = '';

  constructor(
    private productService: ProductService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activeRoute.queryParamMap.subscribe((params) => {
      const id = params.get('id');
      this.editingId = id;
      this.errorMessage = '';
      this.productDraft = { ...EMPTY_PRODUCT };
      this.imagePreview = '';

      if (id) {
        this.loadProduct(id);
      }
    });
  }

  get selectedSubcategories(): string[] {
    return (
      this.categories.find(
        (category) => category.name === this.productDraft.category
      )?.subcategories ?? []
    );
  }

  get discountPercentage(): number | null {
    const originalPrice = this.productDraft.originalPrice;
    if (
      originalPrice === null ||
      originalPrice === undefined ||
      originalPrice <= 0 ||
      originalPrice <= this.productDraft.price
    ) {
      return null;
    }

    return ((originalPrice - this.productDraft.price) / originalPrice) * 100;
  }

  onCategoryChange(): void {
    if (!this.selectedSubcategories.includes(this.productDraft.subcategory)) {
      this.productDraft.subcategory = '';
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const mimeByExtension: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      avif: 'image/avif',
    };
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const supportedMimeType = Object.values(mimeByExtension).includes(file.type)
      ? file.type
      : mimeByExtension[extension];

    if (!supportedMimeType) {
      this.errorMessage = 'Choose a JPEG, PNG, WebP, GIF or AVIF image.';
      input.value = '';
      return;
    }
    if (file.size > 1024 * 1024) {
      this.errorMessage = 'Image must be 1 MB or smaller.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        this.errorMessage = 'Could not read the selected image.';
        return;
      }
      const imageData = reader.result.replace(
        /^data:[^;]*;base64,/,
        `data:${supportedMimeType};base64,`
      );
      this.productDraft.productUrl = imageData;
      this.imagePreview = imageData;
      this.errorMessage = '';
    };
    reader.onerror = () => {
      this.errorMessage = 'Could not read the selected image.';
    };
    reader.readAsDataURL(file);
  }

  saveProduct(): void {
    if (this.saving) {
      return;
    }
    this.saving = true;
    this.errorMessage = '';
    const request = this.editingId
      ? this.productService.updateProduct(this.editingId, this.productDraft)
      : this.productService.addProduct(this.productDraft);

    request.subscribe({
      next: () => {
        this.router.navigate(['/seller-home']);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message ||
          `Could not ${this.editingId ? 'update' : 'add'} the product. Please try again.`;
        this.saving = false;
      },
    });
  }

  private loadProduct(id: string): void {
    this.loadingProduct = true;
    this.productService.getProduct(id).subscribe({
      next: (item: product) => {
        this.productDraft = {
          name: item.name,
          price: item.price,
          category: item.category,
          subcategory: item.subcategory ?? '',
          productUrl: item.productUrl,
          description: item.description,
          color: item.color,
          stockQuantity: item.stockQuantity ?? 0,
          originalPrice: item.originalPrice ?? null,
          isActive: item.isActive ?? true,
        };
        this.imagePreview = item.productUrl;
        this.loadingProduct = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message || 'Could not load this product for editing.';
        this.loadingProduct = false;
      },
    });
  }
}
