import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private endpoint = `${environment.apiUrl}/categories`;

  getCategories(): Observable<Category[]> {
    return this.http
      .get<{ data: Category[] }>(`${this.endpoint}?populate=image&sort=name:asc`)
      .pipe(map((res) => res.data || []));
  }

  getCategoryBySlug(slug: string): Observable<Category | null> {
    const params = new HttpParams().set('filters[slug][$eq]', slug).set('populate', 'image');
    return this.http
      .get<{ data: Category[] }>(this.endpoint, { params })
      .pipe(map((res) => res.data?.[0] ?? null));
  }

  // --- Administration (rôle Admin requis côté Strapi) ---

  createCategory(category: { name: string; description?: string }): Observable<Category> {
    return this.http
      .post<{ data: Category }>(this.endpoint, { data: category })
      .pipe(map((res) => res.data));
  }

  updateCategory(documentId: string, category: { name?: string; description?: string }): Observable<Category> {
    return this.http
      .put<{ data: Category }>(`${this.endpoint}/${documentId}`, { data: category })
      .pipe(map((res) => res.data));
  }

  deleteCategory(documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${documentId}`);
  }
}
