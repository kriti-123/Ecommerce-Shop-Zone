import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { product } from '../data-type';
import {
  EMPTY,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchResult: product[] = [];
  searchSuggestionsVisible = false;
  searchLoading = false;
  searchError = false;
  menuType = 'default';
  userName: string = '';
  cartItem = 0;
  cartLoadError = '';
  private readonly searchTerms = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: Router,
    private productService: ProductService
  ) {}
  ngOnInit(): void {
    this.searchTerms
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query) {
            this.searchLoading = false;
            this.searchError = false;
            return of([]);
          }

          this.searchLoading = true;
          this.searchError = false;
          return this.productService.searchProduct(query).pipe(
            catchError(() => {
              this.searchLoading = false;
              this.searchError = true;
              this.searchResult = [];
              return EMPTY;
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((result) => {
        this.searchResult = result.slice(0, 6);
        this.searchLoading = false;
      });

    this.route.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.setMenuType(event.urlAfterRedirects);
      });
    this.setMenuType(this.route.url);

    const cartData = localStorage.getItem('cartProducts');
    if (localStorage.getItem('authToken') && localStorage.getItem('data')) {
      this.productService.getCart().subscribe({
        error: () => {
          this.cartLoadError = 'Could not load your cart.';
        },
      });
    } else if (cartData) {
      this.cartItem = JSON.parse(cartData).length;
    }

    this.productService.cartData
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.cartItem = count;
        this.cartLoadError = '';
      });
  }

  private setMenuType(url: string): void {
    const sellerData = localStorage.getItem('selerdata');
    const userData = localStorage.getItem('data');

    if (url.includes('seller') && sellerData) {
      this.userName = JSON.parse(sellerData).name;
      this.menuType = 'seller';
    } else if (userData) {
      this.userName = JSON.parse(userData).name;
      this.menuType = 'user';
    } else {
      this.userName = '';
      this.menuType = 'default';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  searchProduct(query: string): void {
    const trimmedQuery = query.trim();
    this.searchSuggestionsVisible = !!trimmedQuery;
    this.searchError = false;
    if (trimmedQuery) {
      this.searchLoading = true;
      this.searchResult = [];
    }
    this.searchTerms.next(trimmedQuery);
  }

  hideSearchResults(): void {
    setTimeout(() => {
      this.searchSuggestionsVisible = false;
    }, 150);
  }

  submitSearch(value: string): void {
    const query = value.trim();
    if (!query) {
      return;
    }

    this.searchSuggestionsVisible = false;
    this.route.navigate(['/search', query]);
  }

  gotoPd(id: string | number): void {
    this.searchSuggestionsVisible = false;
    this.route.navigate(['/detail', id]);
  }
  sellerlogout() {
    localStorage.removeItem('selerdata');
    localStorage.removeItem('data');
    localStorage.removeItem('authToken');
    this.route.navigate(['/sellerAuth']);
  }
  userlogout() {
    localStorage.removeItem('data');
    localStorage.removeItem('selerdata');
    localStorage.removeItem('authToken');
    this.route.navigate(['userAuth']);
  }
}
