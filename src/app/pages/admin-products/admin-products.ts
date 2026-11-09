import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService, mediaUrl } from '../../core/services/product.service';
import { NotificationService } from '../../core/services/notification.service';
import { Product } from '../../models/product.model';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

type StockFilter = '' | 'in' | 'low' | 'out';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmationModalComponent, LoadingSpinnerComponent],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private notification = inject(NotificationService);

  readonly lowStockThreshold = 5;
  readonly mediaUrl = mediaUrl;

  products: Product[] = [];
  searchTerm = '';
  stockFilter: StockFilter = '';
  loading = true;
  errorMessage = '';

  productToDelete: Product | null = null;
  deleting = false;

  get filteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.products.filter((product) => {
      const stock = product.stock ?? 0;
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.sku ?? '').toLowerCase().includes(term);

      const matchesStock =
        !this.stockFilter ||
        (this.stockFilter === 'out' && stock <= 0) ||
        (this.stockFilter === 'low' && stock > 0 && stock <= this.lowStockThreshold) ||
        (this.stockFilter === 'in' && stock > this.lowStockThreshold);

      return matchesSearch && matchesStock;
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.productService.getProducts({ sortBy: 'newest', pageSize: 100 }).subscribe({
      next: (res) => {
        this.products = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les produits. Vérifiez que Strapi est démarré.';
        this.loading = false;
      },
    });
  }

  askDelete(product: Product): void {
    this.productToDelete = product;
  }

  confirmDelete(): void {
    const product = this.productToDelete;
    if (!product?.documentId || this.deleting) return;

    this.deleting = true;
    this.productService.deleteProduct(product.documentId).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.documentId !== product.documentId);
        this.notification.success(`« ${product.name} » a été supprimé`);
        this.productToDelete = null;
        this.deleting = false;
      },
      error: () => {
        this.notification.error('Suppression impossible : vérifiez les droits du rôle Admin.');
        this.productToDelete = null;
        this.deleting = false;
      },
    });
  }
}
