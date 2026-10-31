import { Component } from '@angular/core';
import { STORE_CATEGORIES } from './category-data';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {
  categories = STORE_CATEGORIES;
}
