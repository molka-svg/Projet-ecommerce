import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private cartService = inject(CartService);
  private productService = inject(ProductService);

  get imageUrl(): string {
    return this.productService.getImageUrl(this.product);
  }

  get isOutOfStock(): boolean {
    return (this.product.stock ?? 0) <= 0;
  }

  addToCart(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.isOutOfStock) {
      this.cartService.addItem(this.product, 1);
    }
  }
}
