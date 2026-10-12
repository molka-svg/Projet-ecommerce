export interface Category {
  id: number;
  documentId?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: {
    id: number;
    url: string;
    alternativeText?: string;
  };
  products?: any[];
  createdAt?: string;
  updatedAt?: string;
}
