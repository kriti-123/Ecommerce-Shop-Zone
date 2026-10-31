import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { product } from '../data-type';
import { EMPTY, catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {
  searchResult: product[] = [];
  query = '';
  loading = true;
  loadError = false;

  constructor(
    private productService: ProductService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activeRoute.paramMap
      .pipe(
        switchMap((params) => {
          this.query = params.get('query')?.trim() ?? '';
          this.loading = !!this.query;
          this.loadError = false;
          return this.query
            ? this.productService.searchProduct(this.query).pipe(
                catchError(() => {
                  this.loading = false;
                  this.loadError = true;
                  this.searchResult = [];
                  return EMPTY;
                })
              )
            : of([]);
        })
      )
      .subscribe((result) => {
        this.searchResult = result;
        this.loading = false;
      });
  }
}
