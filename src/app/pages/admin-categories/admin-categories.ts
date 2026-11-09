import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';
import { Category } from '../../models/category.model';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmationModalComponent],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css',
})
export class AdminCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private notification = inject(NotificationService);

  categories: Category[] = [];
  loadingList = true;

  /** documentId de la catégorie en cours d'édition (null = création) */
  editingId: string | null = null;
  name = '';
  description = '';
  loading = false;
  errorMessage = '';

  categoryToDelete: Category | null = null;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loadingList = true;
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loadingList = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les catégories.';
        this.loadingList = false;
      },
    });
  }

  edit(category: Category): void {
    this.editingId = category.documentId ?? null;
    this.name = category.name;
    this.description = category.description ?? '';
    this.errorMessage = '';
  }

  resetForm(): void {
    this.editingId = null;
    this.name = '';
    this.description = '';
    this.errorMessage = '';
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.name.trim()) {
      this.errorMessage = 'Le nom de la catégorie est obligatoire.';
      return;
    }

    const data = { name: this.name.trim(), description: this.description.trim() };
    const request$ = this.editingId
      ? this.categoryService.updateCategory(this.editingId, data)
      : this.categoryService.createCategory(data);

    this.loading = true;
    request$.subscribe({
      next: () => {
        this.loading = false;
        this.notification.success(this.editingId ? 'Catégorie mise à jour' : 'Catégorie créée');
        this.resetForm();
        this.loadCategories();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.error?.message || "L'enregistrement a échoué (nom déjà utilisé ?).";
      },
    });
  }

  confirmDelete(): void {
    const category = this.categoryToDelete;
    this.categoryToDelete = null;
    if (!category?.documentId) return;

    this.categoryService.deleteCategory(category.documentId).subscribe({
      next: () => {
        this.notification.success(`Catégorie « ${category.name} » supprimée`);
        if (this.editingId === category.documentId) this.resetForm();
        this.loadCategories();
      },
      error: () => this.notification.error('Suppression impossible.'),
    });
  }
}
