import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="empty-state-wrapper">
      <div class="empty-icon" aria-hidden="true">{{ icon }}</div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <a *ngIf="actionUrl && actionText" [routerLink]="actionUrl" class="btn btn-primary">
        {{ actionText }}
      </a>
    </div>
  `,
  styles: [`
    .empty-state-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4rem 1.5rem;
      background-color: var(--bg-surface, #FFFFFF);
      border: 1px dashed var(--color-border, #E6E2D8);
      border-radius: var(--radius-lg, 14px);
      max-width: 560px;
      margin: 2rem auto;
    }
    .empty-icon {
      font-size: 3rem;
      color: var(--color-primary, #244C3A);
      margin-bottom: 1rem;
      opacity: 0.75;
    }
    .empty-title {
      font-size: 1.4rem;
      margin-bottom: 0.5rem;
      color: var(--color-text, #252820);
    }
    .empty-description {
      font-size: 0.95rem;
      color: var(--color-text-muted, #676A62);
      max-width: 420px;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = '✧';
  @Input() title = 'Aucun élément trouvé';
  @Input() description = 'Nous n’avons trouvé aucun résultat correspondant à votre recherche.';
  @Input() actionText?: string;
  @Input() actionUrl?: string;
}
