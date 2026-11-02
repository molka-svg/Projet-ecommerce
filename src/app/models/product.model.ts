import { Category } from './category.model';

export interface StrapiMedia {
  id: number;
  url: string;
  name?: string;
  alternativeText?: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

export interface Product {
  id: number;
  documentId?: string;
  name: string;
  slug?: string;
  price: number;
  description?: string;
  stock?: number;
  sku?: string;
  featured?: boolean;
  Image?: StrapiMedia;
  images?: StrapiMedia[];
  categorie?: Category;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface ProductQueryParams {
  search?: string;
  category?: string | number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest';
  page?: number;
  pageSize?: number;
  featured?: boolean;
}

/** Données envoyées à Strapi pour créer / modifier un produit. */
export interface ProductInput {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  featured: boolean;
  /** id numérique du média uploadé */
  Image?: number | null;
  /** documentId de la catégorie */
  categorie?: string | null;
}
