import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, signUp } from '../data-type';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private auth: AuthService, private router: Router) {}

  userSignup(data: signUp, returnUrl?: string): void {
    this.auth.register(data, 'user').subscribe({
      next: (result) => {
        this.saveSession(result);
        this.navigateAfterSignIn(returnUrl);
      },
      error: (error: HttpErrorResponse) => {
        alert(error.error?.message || 'Could not create your account. Please try again.');
      },
    });
  }

  userLogin(
    data: Pick<signUp, 'email' | 'password'>,
    returnUrl?: string
  ): void {
    this.auth.login(data, 'user').subscribe({
      next: (result) => {
        this.saveSession(result);
        this.navigateAfterSignIn(returnUrl);
      },
      error: (error: HttpErrorResponse) => {
        alert(error.error?.message || 'Sign in failed. Check your details and try again.');
      },
    });
  }

  private saveSession(result: AuthResponse): void {
    localStorage.removeItem('selerdata');
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('data', JSON.stringify(result.user));
  }

  private navigateAfterSignIn(returnUrl?: string): void {
    const safeReturnUrl =
      returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
        ? returnUrl
        : '/';
    this.router.navigateByUrl(safeReturnUrl);
  }
}
