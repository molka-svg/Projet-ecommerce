import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductInput, ProductQueryParams, StrapiMedia } from '../../models/product.model';

export interface ProductsResponse {
  data: Product[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private endpoint = `${environment.apiUrl}/products`;

  private basePopulate(): HttpParams {
    return new HttpParams().set('populate[0]', 'Image').set('populate[1]', 'categorie');
  }

  getProducts(queryParams?: ProductQueryParams): Observable<ProductsResponse> {
    let params = this.basePopulate();

    if (queryParams?.search?.trim()) {
      params = params.set('filters[name][$containsi]', queryParams.search.trim());
    }

    if (queryParams?.category) {
      const category = queryParams.category.toString();
      if (/^\d+$/.test(category)) {
        params = params.set('filters[categorie][id][$eq]', category);
      } else {
        params = params.set('filters[categorie][slug][$eq]', category);
      }
    }

    if (queryParams?.minPrice !== undefined && queryParams.minPrice !== null) {
      params = params.set('filters[price][$gte]', queryParams.minPrice.toString());
    }

    if (queryParams?.maxPrice !== undefined && queryParams.maxPrice !== null) {
      params = params.set('filters[price][$lte]', queryParams.maxPrice.toString());
    }

    if (queryParams?.featured !== undefined) {
      params = params.set('filters[featured][$eq]', queryParams.featured ? 'true' : 'false');
    }

    // Sorting
    switch (queryParams?.sortBy) {
      case 'price_asc':
        params = params.set('sort', 'price:asc');
        break;
      case 'price_desc':
        params = params.set('sort', 'price:desc');
        break;
      case 'name_asc':
        params = params.set('sort', 'name:asc');
        break;
      case 'newest':
      default:
        params = params.set('sort', 'createdAt:desc');
        break;
    }

    // Pagination
    if (queryParams?.page) {
      params = params.set('pagination[page]', queryParams.page.toString());
    }
    if (queryParams?.pageSize) {
      params = params.set('pagination[pageSize]', queryParams.pageSize.toString());
    }

    return this.http.get<ProductsResponse>(this.endpoint, { params });
  }

  /**
   * Strapi 5 : GET /products/:documentId. L'id numérique n'est plus accepté dans l'URL,
   * on passe donc par un filtre pour rester compatible avec les anciens liens.
   */
  getProductByIdOrSlug(identifier: string | number): Observable<Product | null> {
    const value = identifier.toString();
    let params = this.basePopulate();

    if (/^\d+$/.test(value)) {
      params = params.set('filters[id][$eq]', value);
    } else {
      params = params
        .set('filters[$or][0][slug][$eq]', value)
        .set('filters[$or][1][documentId][$eq]', value);
    }

    return this.http
      .get<ProductsResponse>(this.endpoint, { params })
      .pipe(map((res) => res.data?.[0] ?? null));
  }

  getFeaturedProducts(limit = 4): Observable<Product[]> {
    return this.getProducts({ featured: true, pageSize: limit }).pipe(
      map((res) => res.data || [])
    );
  }

  getNewArrivals(limit = 4): Observable<Product[]> {
    return this.getProducts({ sortBy: 'newest', pageSize: limit }).pipe(
      map((res) => res.data || [])
    );
  }

  getRelatedProducts(productId: number | string, categoryId?: number | string, limit = 4): Observable<Product[]> {
    const params: ProductQueryParams = { pageSize: limit + 1 };
    if (categoryId) {
      params.category = categoryId;
    }
    return this.getProducts(params).pipe(
      map((res) => (res.data || []).filter((p) => p.id !== Number(productId)).slice(0, limit))
    );
  }

  // --- Administration (rôle Admin requis côté Strapi) ---

  createProduct(productData: ProductInput): Observable<Product> {
    return this.http
      .post<{ data: Product }>(this.endpoint, { data: productData })
      .pipe(map((res) => res.data));
  }

  updateProduct(documentId: string, productData: Partial<ProductInput>): Observable<Product> {
    return this.http
      .put<{ data: Product }>(`${this.endpoint}/${documentId}`, { data: productData })
      .pipe(map((res) => res.data));
  }

  deleteProduct(documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${documentId}`);
  }

  uploadImage(file: File): Observable<StrapiMedia> {
    const formData = new FormData();
    formData.append('files', file);
    return this.http
      .post<StrapiMedia[]>(`${environment.apiUrl}/upload`, formData)
      .pipe(map((res) => res[0]));
  }

  getImageUrl(product: Product): string {
    return mediaUrl(product.Image);
  }
}

/** Construit l'URL absolue d'un média Strapi (local ou hébergé sur un CDN). */
export function mediaUrl(media?: { url: string } | null): string {
  if (!media?.url) return '';
  return media.url.startsWith('http') ? media.url : `${environment.serverUrl}${media.url}`;
}
