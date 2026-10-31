import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DeliveryAddress } from '../data-type';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('submits the delivery details to create a customer order', () => {
    const address: DeliveryAddress = {
      fullName: 'Demo Customer',
      email: 'demo.customer@shopzone.local',
      phone: '+1 555 123 4567',
      addressLine1: '10 Market Street',
      addressLine2: '',
      city: 'Springfield',
      state: 'CA',
      postalCode: '90210',
      country: 'United States',
      deliveryInstructions: '',
    };

    service.placeOrder(address).subscribe();

    const request = httpMock.expectOne('http://localhost:3001/api/orders');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(address);
    request.flush({ id: 'order-1', ...address });
  });

  it('loads the signed-in customer order history', () => {
    service.getOrders().subscribe((orders) => {
      expect(orders).toEqual([]);
    });

    const request = httpMock.expectOne('http://localhost:3001/api/orders');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });
});
