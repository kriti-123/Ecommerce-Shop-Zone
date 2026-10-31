import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerOrder, DeliveryAddress } from '../data-type';

const API_URL = 'http://localhost:3001/api/orders';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  placeOrder(address: DeliveryAddress): Observable<CustomerOrder> {
    return this.http.post<CustomerOrder>(API_URL, address);
  }

  getOrders(): Observable<CustomerOrder[]> {
    return this.http.get<CustomerOrder[]>(API_URL);
  }

  getOrder(orderId: string): Observable<CustomerOrder> {
    return this.http.get<CustomerOrder>(
      `${API_URL}/${encodeURIComponent(orderId)}`
    );
  }

  cancelOrderItem(orderId: string, productId: string): Observable<CustomerOrder> {
    return this.http.patch<CustomerOrder>(
      `${API_URL}/${encodeURIComponent(orderId)}/items/${encodeURIComponent(productId)}/cancel`,
      {}
    );
  }
}
