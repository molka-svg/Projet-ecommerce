import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Order, ORDER_STATUS_LABELS } from '../../models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  orders: Order[] = [];
  loading = true;
  errorMessage = '';
  selectedOrder: Order | null = null;
  readonly orderStatusLabels = ORDER_STATUS_LABELS;

  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/orders' } });
      return;
    }

    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger vos commandes. Veuillez réessayer.';
      },
    });
  }

  viewDetails(order: Order): void {
    this.selectedOrder = this.selectedOrder?.id === order.id ? null : order;
  }
}
