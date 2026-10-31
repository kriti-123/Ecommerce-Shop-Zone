import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse, signUp } from '../data-type';

const API_URL = 'http://localhost:3001/api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  register(data: signUp, role: 'user' | 'seller'): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, {
      ...data,
      role,
    });
  }

  login(
    data: Pick<signUp, 'email' | 'password'>,
    role: 'user' | 'seller'
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, {
      ...data,
      role,
    });
  }
}
