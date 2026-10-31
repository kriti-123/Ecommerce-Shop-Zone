import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { cart, ProductDraft, product } from '../data-type';
import { map, switchMap, tap } from 'rxjs';

const API_URL = 'http://localhost:3001/api';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  cartData = new EventEmitter<number>();
  constructor(private http: HttpClient) {}
  addProduct(data: ProductDraft) {
    return this.http.post<product>(`${API_URL}/products`, data);
  }
  updateProduct(id: string | number, data: ProductDraft) {
    return this.http.patch<product>(
      `${API_URL}/products/${encodeURIComponent(id)}`,
      data
    );
  }
  productList() {
    return this.http.get<product[]>(`${API_URL}/products`);
  }
  sellerProductList() {
    return this.http.get<product[]>(`${API_URL}/products/mine`);
  }
  deleteProductWithId(id: string | number) {
    return this.http.delete(`${API_URL}/products/${id}`);
  }
  popularProducts() {
    return this.http.get<product[]>(`${API_URL}/products?limit=3`);
  }
  topDeals() {
    return this.http.get<product[]>(`${API_URL}/products/top-deals`);
  }
  searchProduct(query: string) {
    const terms = this.normalizeSearchText(query).split(' ').filter(Boolean);
    return this.productList().pipe(
      map((products) =>
        terms.length
          ? products.filter((item) => {
              const searchableText = this.normalizeSearchText(
                [
                  item.name,
                  item.description,
                  item.category,
                  item.subcategory,
                  item.seller,
                  item.color,
                  item.price,
                  item.id,
                ]
                  .filter((value) => value !== undefined && value !== null)
                  .join(' ')
              );
              return terms.every((term) => searchableText.includes(term));
            })
          : []
      )
    );
  }
  getProduct(id: string) {
    return this.http.get<product>(`${API_URL}/products/${encodeURIComponent(id)}`);
  }

  localAddToCart(data: product) {
    const storedCart = localStorage.getItem('cartProducts');
    const items: product[] = storedCart ? JSON.parse(storedCart) : [];
    items.push(data);
    localStorage.setItem('cartProducts', JSON.stringify(items));
    this.cartData.emit(items.length);
  }
  removeItemFromCart(id: string | number) {
    let cartData = localStorage.getItem('cartProducts');
    if (cartData) {
      let items: product[] = JSON.parse(cartData);
      items = items.filter((item: product) => String(id) !== String(item.id));
      localStorage.setItem('cartProducts', JSON.stringify(items));
      this.cartData.emit(items.length);
    }
  }
  addToCart(cartData: cart) {
    return this.http.post<product>(`${API_URL}/cart`, cartData).pipe(
      switchMap(() => this.getCart())
    );
  }

  getCart() {
    return this.http.get<product[]>(`${API_URL}/cart`).pipe(
      tap((items) => this.cartData.emit(items.length))
    );
  }

  removeFromCart(productId: string | number) {
    return this.http
      .delete(`${API_URL}/cart/${encodeURIComponent(productId)}`)
      .pipe(switchMap(() => this.getCart()));
  }

  private normalizeSearchText(value: unknown): string {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
}
