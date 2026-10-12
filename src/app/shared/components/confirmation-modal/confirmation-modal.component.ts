import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onCancel()">
      <div class="modal-card" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button type="button" class="btn btn-danger" (click)="onConfirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(37, 40, 32, 0.45);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
    }
    .modal-card {
      background: #FFFFFF;
      border-radius: var(--radius-lg, 14px);
      padding: 2rem;
      max-width: 440px;
      width: 100%;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--color-border);
    }
    .modal-title {
      font-size: 1.35rem;
      margin-bottom: 0.75rem;
    }
    .modal-message {
      font-size: 0.95rem;
      color: var(--color-text-muted);
      margin-bottom: 1.75rem;
      line-height: 1.5;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmation requise';
  @Input() message = 'Êtes-vous sûr de vouloir effectuer cette action ?';
  @Input() confirmText = 'Confirmer';
  @Input() cancelText = 'Annuler';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
