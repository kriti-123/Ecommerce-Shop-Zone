import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const customerGuard: CanActivateFn = (_route, state) => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('data');

  if (token && user) {
    try {
      if (JSON.parse(user).role === 'user') {
        return true;
      }
    } catch {
      localStorage.removeItem('data');
      localStorage.removeItem('authToken');
    }
  }

  return inject(Router).createUrlTree(['/userAuth'], {
    queryParams: { returnUrl: state.url },
  });
};
