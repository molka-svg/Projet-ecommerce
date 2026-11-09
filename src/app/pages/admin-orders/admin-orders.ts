import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { Order, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../../models/order.model';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private notification = inject(NotificationService);

  readonly orderStatusLabels = ORDER_STATUS_LABELS;
  readonly paymentStatusLabels = PAYMENT_STATUS_LABELS;
  readonly orderStatuses = Object.keys(ORDER_STATUS_LABELS) as Order['orderStatus'][];

  searchTerm = '';
  paymentFilter: '' | Order['paymentStatus'] = '';
  orders: Order[] = [];
  loading = true;
  errorMessage = '';
  expandedId: string | null = null;

  get filteredOrders(): Order[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.orders.filter((order) => {
      const matchesSearch =
        !term ||
        order.orderNumber?.toLowerCase().includes(term) ||
        order.customerEmail?.toLowerCase().includes(term) ||
        (order.customerName ?? '').toLowerCase().includes(term);
      const matchesStatus = !this.paymentFilter || order.paymentStatus === this.paymentFilter;
      return matchesSearch && matchesStatus;
    });
  }

  ngOnInit(): void {
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les commandes (droits Admin requis).';
        this.loading = false;
      },
    });
  }

  toggle(order: Order): void {
    this.expandedId = this.expandedId === order.documentId ? null : (order.documentId ?? null);
  }

  changeStatus(order: Order, orderStatus: Order['orderStatus']): void {
    if (!order.documentId) return;
    const previous = order.orderStatus;
    order.orderStatus = orderStatus;

    this.orderService.updateOrderStatus(order.documentId, { orderStatus }).subscribe({
      next: () =>
        this.notification.success(
          `Commande ${order.orderNumber} : ${this.orderStatusLabels[orderStatus]}`
        ),
      error: () => {
        order.orderStatus = previous;
        this.notification.error('Mise à jour du statut impossible.');
      },
    });
  }
}
