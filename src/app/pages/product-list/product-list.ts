import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductsResponse } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, ProductQueryParams } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  errorMessage = '';

  // Filter & Search states
  searchTerm = '';
  selectedCategory: string | number = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy: 'price_asc' | 'price_desc' | 'name_asc' | 'newest' = 'newest';
  onlyFeatured = false;

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalProducts = 0;
  totalPages = 1;

  ngOnInit(): void {
    // Load categories first
    this.categoryService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: () => {},
    });

    // React to query parameter changes
    this.route.queryParams.subscribe((params) => {
      this.searchTerm = params['search'] || params['q'] || '';
      this.selectedCategory = params['category'] || '';
      this.minPrice = params['minPrice'] ? Number(params['minPrice']) : null;
      this.maxPrice = params['maxPrice'] ? Number(params['maxPrice']) : null;
      this.sortBy = params['sortBy'] || 'newest';
      this.onlyFeatured = params['featured'] === 'true';
      this.currentPage = params['page'] ? Number(params['page']) : 1;

      this.fetchProducts();
    });
  }

  fetchProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    const query: ProductQueryParams = {
      search: this.searchTerm || undefined,
      category: this.selectedCategory || undefined,
      minPrice: this.minPrice !== null ? this.minPrice : undefined,
      maxPrice: this.maxPrice !== null ? this.maxPrice : undefined,
      sortBy: this.sortBy,
      featured: this.onlyFeatured || undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
    };

    this.productService.getProducts(query).subscribe({
      next: (res: ProductsResponse) => {
        this.products = res.data || [];
        if (res.meta?.pagination) {
          this.totalProducts = res.meta.pagination.total;
          this.totalPages = res.meta.pagination.pageCount || 1;
        } else {
          this.totalProducts = this.products.length;
          this.totalPages = Math.ceil(this.totalProducts / this.pageSize) || 1;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement catalogue:', err);
        this.errorMessage = 'Impossible de charger les produits. Veuillez réessayer ultérieurement.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  selectCategory(categorySlugOrId: string | number): void {
    this.selectedCategory = categorySlugOrId;
    this.currentPage = 1;
    this.updateQueryParams();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'newest';
    this.onlyFeatured = false;
    this.currentPage = 1;
    this.updateQueryParams();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.updateQueryParams();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchTerm || null,
        category: this.selectedCategory || null,
        minPrice: this.minPrice || null,
        maxPrice: this.maxPrice || null,
        sortBy: this.sortBy !== 'newest' ? this.sortBy : null,
        featured: this.onlyFeatured ? 'true' : null,
        page: this.currentPage > 1 ? this.currentPage : null,
      },
      queryParamsHandling: 'merge',
    });
  }
}
