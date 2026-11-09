import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private notification = inject(NotificationService);

  newsletterEmail = '';
  subscribed = false;

  onSubscribe(): void {
    if (this.newsletterEmail.trim() && this.newsletterEmail.includes('@')) {
      this.subscribed = true;
      this.notification.success('Merci pour votre inscription à la gazette eshop !');
      this.newsletterEmail = '';
    } else {
      this.notification.warning('Veuillez saisir une adresse e-mail valide.');
    }
  }
}
