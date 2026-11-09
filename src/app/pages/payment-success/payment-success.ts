import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { CartService } from '../../core/services/cart.service';
import { Order } from '../../models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.css',
})
export class PaymentSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private cartService = inject(CartService);

  loading = true;
  verified = false;
  order: Order | null = null;
  errorMessage = '';
  sessionId = '';
  orderNumber = '';

  ngOnInit(): void {
    // Empty the user cart upon reaching success
    this.cartService.clearCart();

    this.route.queryParams.subscribe((params) => {
      this.sessionId = params['session_id'] || '';
      this.orderNumber = params['order_number'] || '';

      const queryIdentifier = this.sessionId || this.orderNumber;

      if (!queryIdentifier) {
        this.loading = false;
        this.errorMessage = 'Aucune référence de session ou de commande fournie.';
        return;
      }

      this.orderService.verifySession(queryIdentifier).subscribe({
        next: (res) => {
          this.verified = true;
          this.order = res.order;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          // Fallback: display orderNumber if present
          if (this.orderNumber) {
            this.verified = true;
          } else {
            this.errorMessage = 'Impossible de vérifier la transaction avec le serveur.';
          }
        },
      });
    });
  }
}
