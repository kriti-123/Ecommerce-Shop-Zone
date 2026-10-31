import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

const API_ORIGIN = 'http://localhost:3001/api/';

@Injectable()
export class ApiAuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('authToken');
    if (!token || !request.url.startsWith(API_ORIGIN)) {
      return next.handle(request);
    }

    return next.handle(
      request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    );
  }
}
