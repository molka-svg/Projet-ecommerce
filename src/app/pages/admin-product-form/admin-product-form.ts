
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.css'
})
export class AdminProductFormComponent {
  name = '';
  description = '';
  price: number | null = null;
  stock: number | null = 0;
  category = '';
  status = 'draft';
  selectedImage: File | null = null;
  errorMessage = '';
  successMessage = '';
  loading = false;

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedImage = input.files?.[0] ?? null;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.name.trim() || !this.description.trim() ||
        this.price === null || this.price < 0) {
      this.errorMessage = 'Vérifiez le nom, la description et le prix.';
      return;
    }

    this.errorMessage =
      'Le formulaire est prêt. La sauvegarde nécessite de confirmer les champs du modèle Product dans Strapi.';
  }
}
