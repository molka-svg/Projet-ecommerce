
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrdersComponent {
  searchTerm = '';
  statusFilter = '';
  orders: any[] = [];
  loading = false;
  errorMessage = '';

  get filteredOrders(): any[] {
    return this.orders.filter(order => {
      const reference = String(order.documentId ?? order.id ?? '');
      const matchesSearch = reference
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter ||
        order.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }
}
