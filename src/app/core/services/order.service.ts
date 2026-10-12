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

  verifySession(sessionId: string): Observable<{ success: boolean; order: Order }> {
    return this.http.get<{ success: boolean; order: Order }>(
      `${this.endpoint}/verify-session/${sessionId}`
    );
  }

  getMyOrders(): Observable<Order[]> {
    return this.http
      .get<{ data: Order[] }>(`${this.endpoint}/my-orders`)
      .pipe(map((res) => res.data || []));
  }

  getOrderById(id: number | string): Observable<Order | null> {
    return this.http
      .get<{ data: Order }>(`${this.endpoint}/${id}`)
      .pipe(map((res) => res.data || null));
  }

  // Admin endpoints
  getAllOrders(): Observable<Order[]> {
    return this.http
      .get<{ data: Order[] }>(`${this.endpoint}?sort=createdAt:desc`)
      .pipe(map((res) => res.data || []));
  }

  updateOrderStatus(id: number | string, status: { orderStatus?: string; paymentStatus?: string }): Observable<Order> {
    return this.http
      .put<{ data: Order }>(`${this.endpoint}/${id}`, { data: status })
      .pipe(map((res) => res.data));
  }
}
