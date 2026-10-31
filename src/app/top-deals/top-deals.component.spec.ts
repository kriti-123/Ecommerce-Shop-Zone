import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { product } from '../data-type';
import { ProductService } from '../services/product.service';
import { TopDealsComponent } from './top-deals.component';

describe('TopDealsComponent', () => {
  let component: TopDealsComponent;
  let fixture: ComponentFixture<TopDealsComponent>;
  let productService: jasmine.SpyObj<ProductService>;

  const deal: product = {
    id: 'deal-1',
    name: 'Discounted headphones',
    description: 'Wireless headphones',
    category: 'Electronics',
    subcategory: 'Headphones',
    seller: 'ShopZone seller',
    color: 'Black',
    price: 80,
    originalPrice: 100,
    discountPercentage: 20,
    productUrl: 'https://example.test/headphones.jpg',
    stockQuantity: 4,
  };

  beforeEach(async () => {
    productService = jasmine.createSpyObj<ProductService>('ProductService', [
      'topDeals',
    ]);
    productService.topDeals.and.returnValue(of([deal]));

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule],
      declarations: [TopDealsComponent],
      providers: [{ provide: ProductService, useValue: productService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TopDealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads eligible products and displays sale and original pricing', () => {
    expect(component).toBeTruthy();
    expect(productService.topDeals).toHaveBeenCalled();
    expect(component.deals).toEqual([deal]);
    expect(fixture.nativeElement.textContent).toContain('Discounted headphones');
    expect(fixture.nativeElement.textContent).toContain('20% off');
    expect(fixture.nativeElement.textContent).toContain('$80.00');
    expect(fixture.nativeElement.textContent).toContain('$100.00');
  });
});
