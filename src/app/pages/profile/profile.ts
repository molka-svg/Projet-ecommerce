import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../models/user.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  user: User | null = null;
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  // Form Fields
  firstName = '';
  lastName = '';
  phone = '';
  address = '';
  postalCode = '';
  city = '';
  country = 'France';

  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/profile' } });
      return;
    }

    this.authService.refreshProfile().subscribe({
      next: (user) => {
        this.user = user || this.authService.currentUser;
        if (this.user) {
          this.firstName = this.user.firstName || '';
          this.lastName = this.user.lastName || '';
          this.phone = this.user.phone || '';
          this.address = this.user.address || '';
          this.postalCode = this.user.postalCode || '';
          this.city = this.user.city || '';
          this.country = this.user.country || 'France';
        }
        this.loading = false;
      },
      error: () => {
        this.user = this.authService.currentUser;
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.saving = true;

    const payload: Partial<User> = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      phone: this.phone.trim(),
      address: this.address.trim(),
      postalCode: this.postalCode.trim(),
      city: this.city.trim(),
      country: this.country.trim(),
    };

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Profil mis à jour avec succès !';
        this.notification.success('Votre profil a été enregistré avec succès');
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = 'Une erreur est survenue lors de la mise à jour de votre profil.';
        this.notification.error(this.errorMessage);
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.notification.info('Vous êtes déconnecté.');
    this.router.navigate(['/']);
  }
}
