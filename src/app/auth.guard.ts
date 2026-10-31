import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (_route, state) => {
  const seller = localStorage.getItem('selerdata');
  const token = localStorage.getItem('authToken');
  if (token && seller) {
    return true;
  }

  return inject(Router).createUrlTree(['/sellerAuth'], {
    queryParams: { returnUrl: state.url },
  });
};
