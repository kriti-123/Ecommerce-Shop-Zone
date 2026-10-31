import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CustomerOrder, OrderTrackingStatus } from '../data-type';
import { OrderService } from '../services/order.service';

const ORDER_STEPS: OrderTrackingStatus[] = [
  'placed',
  'processing',
  'shipped',
  'delivered',
];

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  orders: CustomerOrder[] = [];
  loading = true;
  errorMessage = '';
  actionError = '';
  cancellingItemId: string | null = null;
  readonly steps = ORDER_STEPS;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message || 'Could not load your orders. Please try again.';
        this.loading = false;
      },
    });
  }

  statusLabel(status: OrderTrackingStatus): string {
    const labels: Record<OrderTrackingStatus, string> = {
      placed: 'Order placed',
      processing: 'Preparing',
      shipped: 'On the way',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status];
  }

  statusStep(status: OrderTrackingStatus): number {
    return ORDER_STEPS.indexOf(status);
  }

  trackByOrderId(_index: number, order: CustomerOrder): string {
    return order.id;
  }

  canCancelItems(order: CustomerOrder): boolean {
    return order.status === 'placed' || order.status === 'processing';
  }

  activeItemCount(order: CustomerOrder): number {
    return order.items.filter((item) => item.status !== 'cancelled').length;
  }

  cancelItem(order: CustomerOrder, item: CustomerOrder['items'][number]): void {
    if (
      this.cancellingItemId !== null ||
      !this.canCancelItems(order) ||
      item.status === 'cancelled'
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Cancel ${item.name}? The item total will be removed from this order.`
    );
    if (!confirmed) {
      return;
    }

    this.cancellingItemId = `${order.id}:${item.productId}`;
    this.actionError = '';
    this.orderService.cancelOrderItem(order.id, item.productId).subscribe({
      next: (updatedOrder) => {
        this.orders = this.orders.map((current) =>
          current.id === updatedOrder.id ? updatedOrder : current
        );
        this.cancellingItemId = null;
      },
      error: (error: HttpErrorResponse) => {
        this.actionError =
          error.error?.message || 'Could not cancel this item. Please try again.';
        this.cancellingItemId = null;
      },
    });
  }

  isCancelling(order: CustomerOrder, productId: string): boolean {
    return this.cancellingItemId === `${order.id}:${productId}`;
  }
}
