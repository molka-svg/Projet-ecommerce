import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../models/category.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);

  categories: Category[] = [];
  loading = true;

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
