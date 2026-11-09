import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { Order, PAYMENT_STATUS_LABELS } from '../../models/order.model';
import { Product } from '../../models/product.model';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);

  readonly paymentStatusLabels = PAYMENT_STATUS_LABELS;

  loading = true;
  productCount = 0;
  orderCount = 0;
  revenue = 0;
  recentOrders: Order[] = [];
  lowStock: Product[] = [];

  ngOnInit(): void {
    forkJoin({
      products: this.productService
        .getProducts({ pageSize: 100 })
        .pipe(catchError(() => of({ data: [] as Product[], meta: undefined }))),
      orders: this.orderService.getAllOrders().pipe(catchError(() => of([] as Order[]))),
    }).subscribe(({ products, orders }) => {
      this.productCount = products.meta?.pagination?.total ?? products.data.length;
      this.lowStock = products.data.filter((p) => (p.stock ?? 0) <= 5).slice(0, 5);
      this.orderCount = orders.length;
      this.revenue = orders
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + Number(o.total), 0);
      this.recentOrders = orders.slice(0, 5);
      this.loading = false;
    });
  }
}
