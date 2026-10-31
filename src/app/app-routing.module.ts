import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SellerAuthComponent } from './seller-auth/seller-auth.component';
import { SellerHomeComponent } from './seller-home/seller-home.component';
import { authGuard } from './auth.guard';
import { AddProductComponent } from './add-product/add-product.component';
import { SearchComponent } from './search/search.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { UserAuthComponent } from './user-auth/user-auth.component';
import { CategoryProductsComponent } from './category-products/category-products.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { customerGuard } from './customer.guard';
import { OrdersComponent } from './orders/orders.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'sellerAuth',
    component: SellerAuthComponent,
  },
  {
    path: 'seller-home',
    component: SellerHomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'seller-add-product',
    component: AddProductComponent,
    canActivate: [authGuard],
  },
  {
    path: 'app-product-list',
    redirectTo: 'seller-home',
    pathMatch: 'full',
  },
  {
    path: 'category/:categorySlug',
    component: CategoryProductsComponent,
  },
  {
    path: 'search/:query',
    component: SearchComponent,
  },
  {
    path: 'detail/:productId',
    component: ProductDetailComponent,
  },
  {
    path: 'userAuth',
    component: UserAuthComponent,
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [customerGuard],
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [customerGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [customerGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
