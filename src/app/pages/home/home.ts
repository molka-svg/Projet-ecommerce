import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, LoadingSpinnerComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  categories: Category[] = [];

  loadingFeatured = true;
  loadingNew = true;
  loadingCategories = true;

  ngOnInit(): void {
    this.productService.getFeaturedProducts(4).subscribe({
      next: (prods) => {
        this.featuredProducts = prods;
        this.loadingFeatured = false;
      },
      error: () => (this.loadingFeatured = false),
    });

    this.productService.getNewArrivals(4).subscribe({
      next: (prods) => {
        this.newArrivals = prods;
        this.loadingNew = false;
      },
      error: () => (this.loadingNew = false),
    });

    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loadingCategories = false;
      },
      error: () => (this.loadingCategories = false),
    });
  }
}
