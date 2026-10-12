import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductQueryParams } from '../../models/product.model';

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

  getProducts(queryParams?: ProductQueryParams): Observable<ProductsResponse> {
    let params = new HttpParams()
      .set('populate[0]', 'Image')
      .set('populate[1]', 'categorie');

    if (queryParams?.search?.trim()) {
      params = params.set('filters[name][$containsi]', queryParams.search.trim());
    }

    if (queryParams?.category) {
      if (typeof queryParams.category === 'number' || !isNaN(Number(queryParams.category))) {
        params = params.set('filters[categorie][id][$eq]', queryParams.category.toString());
      } else {
        params = params.set('filters[categorie][slug][$eq]', queryParams.category.toString());
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

  getProductById(id: number | string): Observable<Product | null> {
    return this.http
      .get<{ data: Product }>(`${this.endpoint}/${id}?populate[0]=Image&populate[1]=categorie`)
      .pipe(map((res) => res.data || null));
  }

  getProductBySlug(slug: string): Observable<Product | null> {
    return this.http
      .get<ProductsResponse>(
        `${this.endpoint}?filters[slug][$eq]=${slug}&populate[0]=Image&populate[1]=categorie`
      )
      .pipe(map((res) => (res.data && res.data.length > 0 ? res.data[0] : null)));
  }

  getProductByIdOrSlug(identifier: string | number): Observable<Product | null> {
    const isNum = typeof identifier === 'number' || /^\d+$/.test(identifier.toString());
    if (isNum) {
      return this.getProductById(identifier);
    }
    return this.getProductBySlug(identifier.toString());
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
    let params: ProductQueryParams = { pageSize: limit + 1 };
    if (categoryId) {
      params.category = categoryId;
    }
    return this.getProducts(params).pipe(
      map((res) => (res.data || []).filter((p) => p.id !== Number(productId)).slice(0, limit))
    );
  }

  createProduct(productData: any): Observable<Product> {
    return this.http
      .post<{ data: Product }>(this.endpoint, { data: productData })
      .pipe(map((res) => res.data));
  }

  updateProduct(id: number | string, productData: any): Observable<Product> {
    return this.http
      .put<{ data: Product }>(`${this.endpoint}/${id}`, { data: productData })
      .pipe(map((res) => res.data));
  }

  deleteProduct(id: number | string): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id}`);
  }

  uploadImage(file: File): Observable<{ id: number; url: string }> {
    const formData = new FormData();
    formData.append('files', file);
    return this.http.post<any[]>(`${environment.apiUrl}/upload`, formData).pipe(
      map((res) => {
        const uploaded = res[0];
        return {
          id: uploaded.id,
          url: uploaded.url.startsWith('http')
            ? uploaded.url
            : `${environment.serverUrl}${uploaded.url}`,
        };
      })
    );
  }

  getImageUrl(product: Product): string {
    if (product.Image?.url) {
      return product.Image.url.startsWith('http')
        ? product.Image.url
        : `${environment.serverUrl}${product.Image.url}`;
    }
    return '';
  }
}
