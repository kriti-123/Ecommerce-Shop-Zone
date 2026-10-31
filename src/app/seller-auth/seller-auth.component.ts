import { Component } from '@angular/core';
import { SellerService } from '../services/seller.service';
import { Router } from '@angular/router';
import { signUp } from '../data-type';


@Component({
  selector: 'app-seller-auth',
  templateUrl: './seller-auth.component.html',
})
export class SellerAuthComponent {
  constructor(private seller:SellerService,private router:Router){}
  showlogin = false;
   signUp(data:signUp):void{
     this.seller.userSignup(data);
   }
   signIn(data:Pick<signUp, 'email' | 'password'>):void{
    this.seller.userLogin(data);
   }
   openlogin(){
     this.showlogin = true;
   }
   opensignup(){
    this.showlogin = false;
   }
   
}
