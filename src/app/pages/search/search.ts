import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  searchQuery = '';
  products: Product[] = [];
  loading = false;
  hasSearched = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const q = params['q'] || params['search'] || '';
      this.searchQuery = q;
      if (q.trim()) {
        this.performSearch(q.trim());
      } else {
        this.products = [];
        this.hasSearched = false;
      }
    });
  }

  performSearch(query: string): void {
    this.loading = true;
    this.hasSearched = true;
    this.productService.getProducts({ search: query, pageSize: 24 }).subscribe({
      next: (res) => {
        this.products = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: this.searchQuery.trim() },
        queryParamsHandling: 'merge',
      });
    }
  }
}
