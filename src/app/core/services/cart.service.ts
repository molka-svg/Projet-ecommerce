import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem } from '../../models/cart.model';
import { Product } from '../../models/product.model';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private notificationService = inject(NotificationService);
  private storageKey = 'eshop_cart';

  private itemsSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
  items$ = this.itemsSubject.asObservable();

  count$ = this.items$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.quantity, 0))
  );

  subtotal$ = this.items$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0))
  );

  get items(): CartItem[] {
    return this.itemsSubject.getValue();
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get totalCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  private loadCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey) || sessionStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveCart(items: CartItem[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.warn('Cart storage error:', e);
    }
    this.itemsSubject.next(items);
  }

  getImageUrl(product: Product): string {
    if (product.Image?.url) {
      return product.Image.url.startsWith('http')
        ? product.Image.url
        : `${environment.serverUrl}${product.Image.url}`;
    }
    return '';
  }

  addItem(product: Product, quantity = 1): void {
    const currentItems = [...this.items];
    const existingIndex = currentItems.findIndex((i) => i.id === product.id);

    const availableStock = product.stock ?? 99;
    const currentQty = existingIndex > -1 ? currentItems[existingIndex].quantity : 0;
    const newQty = currentQty + quantity;

    if (newQty > availableStock) {
      this.notificationService.warning(
        `Quantité maximale atteinte (${availableStock} disponible${availableStock > 1 ? 's' : ''})`
      );
      return;
    }

    if (existingIndex > -1) {
      currentItems[existingIndex].quantity = newQty;
    } else {
      currentItems.push({
        id: product.id,
        documentId: product.documentId,
        name: product.name,
        price: Number(product.price),
        quantity: Math.max(1, quantity),
        imageUrl: this.getImageUrl(product),
        stock: product.stock,
        categoryName: product.categorie?.name,
      });
    }

    this.saveCart(currentItems);
    this.notificationService.success(`"${product.name}" ajouté au panier`);
  }

  updateQuantity(id: number | string, delta: number): void {
    let currentItems = [...this.items];
    const item = currentItems.find((i) => i.id === id);

    if (!item) return;

    const newQty = item.quantity + delta;

    if (item.stock && newQty > item.stock) {
      this.notificationService.warning(`Stock limité à ${item.stock} unités`);
      return;
    }

    if (newQty <= 0) {
      this.removeItem(id);
      return;
    }

    item.quantity = newQty;
    this.saveCart(currentItems);
  }

  setQuantity(id: number | string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }

    const currentItems = [...this.items];
    const item = currentItems.find((i) => i.id === id);
    if (!item) return;

    if (item.stock && quantity > item.stock) {
      quantity = item.stock;
      this.notificationService.warning(`Stock limité à ${item.stock} unités`);
    }

    item.quantity = quantity;
    this.saveCart(currentItems);
  }

  removeItem(id: number | string): void {
    const currentItems = this.items.filter((i) => i.id !== id);
    this.saveCart(currentItems);
    this.notificationService.info('Article retiré du panier');
  }

  clearCart(): void {
    this.saveCart([]);
  }
}
