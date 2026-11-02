import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '../../models/product.model';

const product = (over: Partial<Product> = {}): Product => ({
  id: 1,
  documentId: 'doc1',
  name: 'Bougie',
  price: 24.9,
  stock: 3,
  ...over,
});

describe('CartService', () => {
  let cart: CartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    cart = TestBed.inject(CartService);
  });

  it('adds items and computes subtotal and count', () => {
    cart.addItem(product(), 2);
    cart.addItem(product({ id: 2, documentId: 'doc2', price: 10 }), 1);
    expect(cart.totalCount).toBe(3);
    expect(cart.subtotal).toBeCloseTo(59.8);
  });

  it('merges quantities for the same product', () => {
    cart.addItem(product(), 1);
    cart.addItem(product(), 1);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].quantity).toBe(2);
  });

  it('never exceeds the available stock', () => {
    cart.addItem(product(), 3);
    cart.addItem(product(), 1);
    expect(cart.items[0].quantity).toBe(3);
    cart.updateQuantity(1, +1);
    expect(cart.items[0].quantity).toBe(3);
  });

  it('removes the item when quantity reaches 0', () => {
    cart.addItem(product(), 1);
    cart.updateQuantity(1, -1);
    expect(cart.items.length).toBe(0);
  });

  it('persists the cart in localStorage', () => {
    cart.addItem(product(), 1);
    expect(JSON.parse(localStorage.getItem('eshop_cart')!)[0].name).toBe('Bougie');
  });

  it('does not mutate previous state snapshots', () => {
    cart.addItem(product(), 1);
    const before = cart.items;
    cart.updateQuantity(1, +1);
    expect(before[0].quantity).toBe(1);
  });
});
