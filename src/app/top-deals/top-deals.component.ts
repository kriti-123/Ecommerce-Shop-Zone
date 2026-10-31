import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { product } from '../data-type';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-top-deals',
  templateUrl: './top-deals.component.html',
  styleUrl: './top-deals.component.css',
})
export class TopDealsComponent implements OnInit {
  deals: product[] = [];
  loading = true;
  errorMessage = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.topDeals().subscribe({
      next: (deals) => {
        this.deals = deals;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message || 'Top Deals could not be loaded. Please try again.';
        this.loading = false;
      },
    });
  }
}
