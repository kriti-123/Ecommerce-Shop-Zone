import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('registers a customer against the backend auth API', () => {
    service
      .register(
        { name: 'Customer', email: 'customer@example.com', password: 'password123' },
        'user'
      )
      .subscribe();

    const request = httpMock.expectOne('http://localhost:3001/api/auth/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.role).toBe('user');
    request.flush({ token: 'test-token', user: { id: '1', name: 'Customer', email: 'customer@example.com', role: 'user' } });
  });

  it('signs sellers in against the backend auth API', () => {
    service
      .login({ email: 'seller@example.com', password: 'password123' }, 'seller')
      .subscribe();

    const request = httpMock.expectOne('http://localhost:3001/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.role).toBe('seller');
    request.flush({ token: 'test-token', user: { id: '2', name: 'Seller', email: 'seller@example.com', role: 'seller' } });
  });
});
