import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { product } from '../data-type';
import { STORE_CATEGORIES, StoreCategory } from '../category/category-data';

@Component({
  selector: 'app-category-products',
  templateUrl: './category-products.component.html',
})
export class CategoryProductsComponent implements OnInit {
  categories = STORE_CATEGORIES;
  category: StoreCategory | undefined;
  allProducts: product[] = [];
  visibleProducts: product[] = [];
  selectedSubcategory = '';
  sortOrder = 'relevance';
  maxPrice = Number.POSITIVE_INFINITY;
  selectedPriceLimit = '';
  loading = true;
  loadError = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('categorySlug')?.toLowerCase();
      this.category = this.categories.find((category) => category.slug === slug);
      this.updateProducts();
    });

    this.route.queryParamMap.subscribe((params) => {
      this.selectedSubcategory = params.get('subcategory') ?? '';
      this.updateProducts();
    });

    this.productService.productList().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.loading = false;
        this.loadError = false;
        this.updateProducts();
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      },
    });
  }

  updateProducts(): void {
    const category = this.category;
    if (!category) {
      this.visibleProducts = [];
      return;
    }

    const categoryProducts = this.allProducts.filter((item) =>
      this.matchesCategory(item, category)
    );
    const subcategoryProducts = this.selectedSubcategory
      ? categoryProducts.filter((item) =>
          this.matchesSubcategory(item, this.selectedSubcategory)
        )
      : categoryProducts;

    this.visibleProducts = [...subcategoryProducts]
      .filter((item) => item.price <= this.maxPrice)
      .sort((a, b) => {
        if (this.sortOrder === 'price-low') {
          return a.price - b.price;
        }
        if (this.sortOrder === 'price-high') {
          return b.price - a.price;
        }
        return a.name.localeCompare(b.name);
      });
  }

  setSortOrder(sortOrder: string): void {
    this.sortOrder = sortOrder;
    this.updateProducts();
  }

  setMaxPrice(value: string): void {
    this.selectedPriceLimit = value;
    this.maxPrice = value ? Number(value) : Number.POSITIVE_INFINITY;
    this.updateProducts();
  }

  clearFilters(): void {
    this.selectedPriceLimit = '';
    this.maxPrice = Number.POSITIVE_INFINITY;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
    this.updateProducts();
  }

  get hasActiveFilters(): boolean {
    return !!this.selectedSubcategory || !!this.selectedPriceLimit;
  }

  private matchesCategory(item: product, category: StoreCategory): boolean {
    const productCategory = item.category?.trim().toLowerCase();
    if (productCategory) {
      return (
        productCategory === category.name.toLowerCase() ||
        productCategory === category.slug
      );
    }

    const searchableText = `${item.name} ${item.description}`.toLowerCase();
    if (
      category.slug === 'mobile' &&
      /\bhead\s*phones?\b/.test(searchableText)
    ) {
      return false;
    }

    return category.keywords.some((keyword) =>
      this.containsKeyword(searchableText, keyword)
    );
  }

  private matchesSubcategory(item: product, subcategory: string): boolean {
    const productSubcategory = item.subcategory?.trim().toLowerCase();
    if (productSubcategory) {
      return productSubcategory === subcategory.toLowerCase();
    }

    const searchableText =
      `${item.name} ${item.description} ${item.category ?? ''}`.toLowerCase();
    const subcategoryTerms: Record<string, string[]> = {
      cameras: ['camera', 'photography'],
      computers: ['computer', 'laptop', 'macbook', 'mac book', 'dell'],
      headphones: ['headphone', 'head phone', 'earbud', 'headset'],
      speakers: ['speaker', 'audio'],
      'kitchen appliances': ['kitchen appliance', 'microwave', 'oven', 'blender', 'toaster'],
      laundry: ['laundry', 'washing machine', 'washer', 'dryer'],
      'vacuum cleaners': ['vacuum'],
      'air conditioning': ['air conditioning', 'air conditioner'],
    };
    const searchTerms =
      subcategoryTerms[subcategory.toLowerCase()] ?? [subcategory.toLowerCase()];

    return searchTerms.some((term) => this.containsKeyword(searchableText, term));
  }

  private containsKeyword(text: string, keyword: string): boolean {
    const wordPattern = keyword
      .trim()
      .split(/\s+/)
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('\\s+');
    return new RegExp(`\\b${wordPattern}s?\\b`, 'i').test(text);
  }
}
