import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { signUp } from '../data-type';

@Component({
  selector: 'app-user-auth',
  templateUrl: './user-auth.component.html',
})
export class UserAuthComponent implements OnInit {
  private returnUrl = '/';

  constructor(
    private route: Router,
    private activeRoute: ActivatedRoute,
    private user: UserService
  ) {}

  ngOnInit(): void {
    this.returnUrl =
      this.activeRoute.snapshot.queryParamMap.get('returnUrl') || '/';
  }
  showlogin = false;
  signUp(data: signUp): void {
    this.user.userSignup(data, this.returnUrl);
  }
  signIn(data: Pick<signUp, 'email' | 'password'>): void {
    this.user.userLogin(data, this.returnUrl);
    // setTimeout(() => {
    //   localStorage.clear();
    //   this.route.navigate(['userAuth']);
    // }, 10000);
  }
  openlogin() {
    this.showlogin = true;
  }
  opensignup() {
    this.showlogin = false;
  }
  localCartToRemoteCart() {
    let data = localStorage.getItem('cartProducts');
    if (data) {
      let user = localStorage.getItem('data');
      let userId = user && JSON.parse(user);
      let cartDataList = JSON.parse(data);
    }
  }
}
