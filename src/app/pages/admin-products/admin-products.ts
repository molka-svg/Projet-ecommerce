
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css'
})
export class AdminProductsComponent implements OnInit {
  private http = inject(HttpClient);

  products: any[] = [];
  searchTerm = '';
  statusFilter = '';
  loading = true;
  errorMessage = '';

  get filteredProducts(): any[] {
    return this.products.filter(product => {
      const matchesSearch = (product.name ?? '')
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter ||
        product.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  ngOnInit(): void {
    const jwt = sessionStorage.getItem('eshop_jwt');

    if (!jwt) {
      this.errorMessage = 'Connexion administrateur requise.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${jwt}` });

    this.http.get<any>('http://localhost:1337/api/products', { headers })
      .subscribe({
        next: response => {
          this.products = response.data ?? [];
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Impossible de charger les produits.';
          this.loading = false;
        }
      });
  }
}
