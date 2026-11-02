import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { ProductService, mediaUrl } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';
import { Category } from '../../models/category.model';
import { ProductInput, StrapiMedia } from '../../models/product.model';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.css',
})
export class AdminProductFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private notification = inject(NotificationService);

  readonly maxImageSize = 5 * 1024 * 1024;

  /** documentId du produit en cours de modification (null = création) */
  editId: string | null = null;

  name = '';
  description = '';
  price: number | null = null;
  stock: number | null = 0;
  sku = '';
  featured = false;
  categoryId = '';
  categories: Category[] = [];

  currentImage: StrapiMedia | null = null;
  selectedImage: File | null = null;
  previewUrl = '';

  errorMessage = '';
  loading = false;
  loadingProduct = false;

  get isEdit(): boolean {
    return !!this.editId;
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
    });

    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.loadProduct(this.editId);
    }
  }

  private loadProduct(documentId: string): void {
    this.loadingProduct = true;
    this.productService.getProductByIdOrSlug(documentId).subscribe({
      next: (product) => {
        this.loadingProduct = false;
        if (!product) {
          this.errorMessage = 'Produit introuvable.';
          return;
        }
        this.name = product.name;
        this.description = product.description ?? '';
        this.price = Number(product.price);
        this.stock = product.stock ?? 0;
        this.sku = product.sku ?? '';
        this.featured = !!product.featured;
        this.categoryId = product.categorie?.documentId ?? '';
        this.currentImage = product.Image ?? null;
        this.previewUrl = mediaUrl(product.Image);
      },
      error: () => {
        this.loadingProduct = false;
        this.errorMessage = 'Impossible de charger le produit.';
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.errorMessage = '';

    if (file && file.size > this.maxImageSize) {
      this.errorMessage = "L'image ne doit pas dépasser 5 Mo.";
      input.value = '';
      return;
    }

    this.selectedImage = file;
    this.previewUrl = file ? URL.createObjectURL(file) : mediaUrl(this.currentImage);
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.name.trim() || !this.description.trim()) {
      this.errorMessage = 'Le nom et la description sont obligatoires.';
      return;
    }
    if (this.price === null || this.price < 0) {
      this.errorMessage = 'Le prix doit être un nombre positif.';
      return;
    }
    if (this.stock === null || this.stock < 0 || !Number.isInteger(this.stock)) {
      this.errorMessage = 'Le stock doit être un nombre entier positif.';
      return;
    }

    this.loading = true;

    // 1) upload éventuel de l'image, 2) création ou mise à jour du produit
    const upload$: Observable<StrapiMedia | null> = this.selectedImage
      ? this.productService.uploadImage(this.selectedImage)
      : of(this.currentImage);

    upload$
      .pipe(
        switchMap((image) => {
          const data: ProductInput = {
            name: this.name.trim(),
            description: this.description.trim(),
            price: Number(this.price),
            stock: Number(this.stock),
            sku: this.sku.trim() || undefined,
            featured: this.featured,
            Image: image?.id ?? null,
            categorie: this.categoryId || null,
          };
          return this.editId
            ? this.productService.updateProduct(this.editId, data)
            : this.productService.createProduct(data);
        })
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.notification.success(this.isEdit ? 'Produit mis à jour' : 'Produit créé');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err.error?.error?.message ||
            "L'enregistrement a échoué. Vérifiez les droits du rôle Admin dans Strapi.";
        },
      });
  }
}
