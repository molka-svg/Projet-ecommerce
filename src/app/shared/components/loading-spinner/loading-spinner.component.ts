import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class.full-page]="fullPage">
      <div class="spinner" [style.width.px]="size" [style.height.px]="size"></div>
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
      gap: 1rem;
    }
    .spinner-container.full-page {
      min-height: 50vh;
    }
    .spinner {
      border: 3px solid var(--color-sage, #DCE5D9);
      border-top-color: var(--color-primary, #244C3A);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-message {
      font-size: 0.95rem;
      color: var(--color-text-muted, #676A62);
      font-style: italic;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size = 40;
  @Input() message = 'Chargement en cours...';
  @Input() fullPage = false;
}
