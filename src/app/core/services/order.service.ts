import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, CheckoutPayload, CheckoutResponse } from '../../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private endpoint = `${environment.apiUrl}/orders`;

  createCheckoutSession(payload: CheckoutPayload): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.endpoint}/checkout-session`, payload);
  }

  verifySession(sessionIdOrOrderNumber: string): Observable<{ success: boolean; order: Order }> {
    return this.http.get<{ success: boolean; order: Order }>(
      `${this.endpoint}/verify-session/${encodeURIComponent(sessionIdOrOrderNumber)}`
    );
  }

  getMyOrders(): Observable<Order[]> {
    return this.http
      .get<{ data: Order[] }>(`${this.endpoint}/my-orders`)
      .pipe(map((res) => res.data || []));
  }

  // --- Administration (rôle Admin requis côté Strapi) ---

  getAllOrders(): Observable<Order[]> {
    return this.http
      .get<{ data: Order[] }>(`${this.endpoint}?sort=createdAt:desc&pagination[pageSize]=100`)
      .pipe(map((res) => res.data || []));
  }

  updateOrderStatus(
    documentId: string,
    status: { orderStatus?: Order['orderStatus']; paymentStatus?: Order['paymentStatus'] }
  ): Observable<Order> {
    return this.http
      .put<{ data: Order }>(`${this.endpoint}/${documentId}`, { data: status })
      .pipe(map((res) => res.data));
  }
}
