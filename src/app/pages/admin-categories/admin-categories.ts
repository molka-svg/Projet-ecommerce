
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css'
})
export class AdminCategoriesComponent {
  name = '';
  description = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.name.trim()) {
      this.errorMessage = 'Le nom de la catégorie est obligatoire.';
      return;
    }

    this.errorMessage =
      'La sauvegarde nécessite de connecter ce formulaire au modèle de catégories configuré dans Strapi.';
  }
}
