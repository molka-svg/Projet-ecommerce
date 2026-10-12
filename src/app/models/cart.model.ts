export interface CartItem {
  id: number | string;
  documentId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  stock?: number;
  categoryName?: string;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  totalQuantity: number;
  shipping: number;
  total: number;
}
