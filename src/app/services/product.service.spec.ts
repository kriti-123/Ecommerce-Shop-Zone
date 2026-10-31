import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { product } from '../data-type';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideRouter([])],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('searches across product details and matches every query term', () => {
    const products: product[] = [
      {
        id: 42,
        name: 'Device Pro',
        description: 'Daily companion',
        category: 'Mobile',
        subcategory: 'Smartphones',
        seller: 'Acme Labs',
        color: 'Midnight Blue',
        price: 12345,
        productUrl: '',
        quantity: 1,
      },
      {
        id: 43,
        name: 'Device Case',
        description: 'Protective cover',
        category: 'Accessories',
        seller: 'Other Store',
        color: 'Black',
        price: 25,
        productUrl: '',
        quantity: 1,
      },
    ];

    service.searchProduct('  ACME   blue ').subscribe((result) => {
      expect(result.map((item) => item.id)).toEqual([42]);
    });

    const request = httpMock.expectOne('http://localhost:3001/api/products');
    expect(request.request.method).toBe('GET');
    request.flush(products);
  });

  it('searches numeric product identifiers and prices', () => {
    const products: product[] = [
      {
        id: 42,
        name: 'Device Pro',
        description: 'Daily companion',
        category: 'Mobile',
        seller: 'Acme Labs',
        color: 'Blue',
        price: 12345,
        productUrl: '',
        quantity: 1,
      },
    ];

    service.searchProduct('12345').subscribe((result) => {
      expect(result).toEqual(products);
    });

    httpMock.expectOne('http://localhost:3001/api/products').flush(products);
  });

  it('loads one product by its MongoDB identifier', () => {
    const expectedProduct: product = {
      id: 4,
      name: 'Device Pro',
      description: 'Daily companion',
      category: 'Mobile',
      seller: 'Acme Labs',
      color: 'Blue',
      price: 12345,
      productUrl: '',
      quantity: 1,
    };

    service.getProduct('4').subscribe((result) => {
      expect(result).toEqual(expectedProduct);
    });

    const request = httpMock.expectOne('http://localhost:3001/api/products/4');
    expect(request.request.method).toBe('GET');
    request.flush(expectedProduct);
  });

  it('loads products eligible for Top Deals from the backend', () => {
    const deals: product[] = [
      {
        id: 'deal-1',
        name: 'Discounted headphones',
        description: 'Wireless headphones',
        category: 'Electronics',
        seller: 'Acme',
        color: 'Black',
        price: 80,
        originalPrice: 100,
        discountPercentage: 20,
        productUrl: '',
        stockQuantity: 2,
      },
    ];

    service.topDeals().subscribe((result) => {
      expect(result).toEqual(deals);
    });

    const request = httpMock.expectOne(
      'http://localhost:3001/api/products/top-deals'
    );
    expect(request.request.method).toBe('GET');
    request.flush(deals);
  });

  it('updates a listing including its available stock quantity', () => {
    const update = {
      name: 'Device Pro',
      description: 'Daily companion',
      price: 99,
      category: 'Mobile',
      subcategory: '',
      productUrl: 'https://example.com/device.png',
      color: 'Blue',
      stockQuantity: 8,
    };

    service.updateProduct('mongo-id', update).subscribe();

    const request = httpMock.expectOne(
      'http://localhost:3001/api/products/mongo-id'
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body.stockQuantity).toBe(8);
    request.flush({ id: 'mongo-id', ...update, seller: 'Acme' });
  });
});
