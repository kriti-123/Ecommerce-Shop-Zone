import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, signUp } from '../data-type';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  constructor(private auth: AuthService, private router: Router) {}

  userSignup(data: signUp): void {
    this.auth.register(data, 'seller').subscribe({
      next: (result) => {
        this.saveSession(result);
        this.router.navigate(['/seller-home']);
      },
      error: (error: HttpErrorResponse) => {
        alert(error.error?.message || 'Could not create your seller account. Please try again.');
      },
    });
  }

  userLogin(data: Pick<signUp, 'email' | 'password'>): void {
    this.auth.login(data, 'seller').subscribe({
      next: (result) => {
        this.saveSession(result);
        this.router.navigate(['/seller-home']);
      },
      error: (error: HttpErrorResponse) => {
        alert(error.error?.message || 'Sign in failed. Check your details and try again.');
      },
    });
  }

  private saveSession(result: AuthResponse): void {
    localStorage.removeItem('data');
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('selerdata', JSON.stringify(result.user));
  }
}
