import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
      .get<{ data: Category[] }>(`${this.endpoint}?populate=*&sort=name:asc`)
      .pipe(map((res) => res.data || []));
  }

  getCategoryBySlug(slug: string): Observable<Category | null> {
    return this.http
      .get<{ data: Category[] }>(`${this.endpoint}?filters[slug][$eq]=${slug}&populate=*`)
      .pipe(map((res) => (res.data && res.data.length > 0 ? res.data[0] : null)));
  }

  getCategoryById(id: number | string): Observable<Category | null> {
    return this.http
      .get<{ data: Category }>(`${this.endpoint}/${id}?populate=*`)
      .pipe(map((res) => res.data || null));
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http
      .post<{ data: Category }>(this.endpoint, { data: category })
      .pipe(map((res) => res.data));
  }

  updateCategory(id: number | string, category: Partial<Category>): Observable<Category> {
    return this.http
      .put<{ data: Category }>(`${this.endpoint}/${id}`, { data: category })
      .pipe(map((res) => res.data));
  }

  deleteCategory(id: number | string): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id}`);
  }
}
