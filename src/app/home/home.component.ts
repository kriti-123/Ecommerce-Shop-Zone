import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { product } from '../data-type';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  popularList:undefined|product[];
  productList:undefined|product[];
  latestProducts: product[] = [];

  constructor(private http:HttpClient,private productService:ProductService){
  // ngOnInIt():void{
       this.productService.popularProducts().subscribe((result)=>{
         if(result){
           this.popularList = result;
           console.log("product popular",this.popularList);
         }
        });
        this.productService.productList().subscribe((result)=>{
          this.productList = result;
          this.latestProducts = [...result]
            .sort((a, b) => {
              const dateDifference =
                new Date(b.createdAt ?? 0).getTime() -
                new Date(a.createdAt ?? 0).getTime();
              return Number.isNaN(dateDifference) || dateDifference === 0
                ? String(b.id).localeCompare(String(a.id), undefined, {
                    numeric: true,
                  })
                : dateDifference;
            })
            .slice(0, 4);
        })
  }
}
