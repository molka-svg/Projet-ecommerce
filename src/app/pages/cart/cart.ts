import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent {
  cartService = inject(CartService);

  readonly shippingThreshold = 80;

  get shippingCost(): number {
    if (this.cartService.items.length === 0) return 0;
    return this.cartService.subtotal >= this.shippingThreshold ? 0 : 9.9;
  }

  get total(): number {
    return this.cartService.subtotal + this.shippingCost;
  }

  get freeShippingRemaining(): number {
    return Math.max(0, this.shippingThreshold - this.cartService.subtotal);
  }

  get shippingProgress(): number {
    return Math.min(100, (this.cartService.subtotal / this.shippingThreshold) * 100);
  }
}
