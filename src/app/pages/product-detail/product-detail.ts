import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProductCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  product: Product | null = null;
  relatedProducts: Product[] = [];
  loading = true;
  quantity = 1;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idOrSlug = params.get('id');
      if (idOrSlug) {
        this.fetchProduct(idOrSlug);
      }
    });
  }

  fetchProduct(idOrSlug: string): void {
    this.loading = true;
    this.product = null;
    this.quantity = 1;

    this.productService.getProductByIdOrSlug(idOrSlug).subscribe({
      next: (prod) => {
        this.product = prod;
        this.loading = false;
        if (prod) {
          this.loadRelatedProducts(prod);
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadRelatedProducts(product: Product): void {
    const catId = product.categorie?.id;
    this.productService.getRelatedProducts(product.id, catId, 4).subscribe({
      next: (related) => (this.relatedProducts = related),
      error: () => {},
    });
  }

  get imageUrl(): string {
    return this.product ? this.productService.getImageUrl(this.product) : '';
  }

  get isOutOfStock(): boolean {
    return (this.product?.stock ?? 0) <= 0;
  }

  incrementQuantity(): void {
    const maxStock = this.product?.stock ?? 99;
    if (this.quantity < maxStock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product && !this.isOutOfStock) {
      this.cartService.addItem(this.product, this.quantity);
    }
  }
}
