export interface OrderItemSnapshot {
  productId: number;
  documentId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  subtotal: number;
}

export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: number;
  documentId?: string;
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  total: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  shippingAddress?: ShippingAddress;
  createdAt: string;
  updatedAt?: string;
}

export interface CheckoutPayload {
  items: { id: number | string; quantity: number }[];
  customer: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  shippingAddress: ShippingAddress;
}

export interface CheckoutResponse {
  success: boolean;
  orderNumber: string;
  orderId: number;
  checkoutUrl?: string;
  sessionId?: string;
  requiresStripeConfiguration?: boolean;
  message?: string;
}

export const PAYMENT_STATUS_LABELS: Record<Order['paymentStatus'], string> = {
  pending: 'En attente',
  paid: 'Payée',
  failed: 'Échouée',
  cancelled: 'Annulée',
};

export const ORDER_STATUS_LABELS: Record<Order['orderStatus'], string> = {
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};
