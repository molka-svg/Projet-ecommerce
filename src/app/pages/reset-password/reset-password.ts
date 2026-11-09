import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  code = '';
  password = '';
  passwordConfirmation = '';
  loading = false;
  errorMessage = '';
  success = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.code = params['code'] || '';
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.code.trim() || !this.password || !this.passwordConfirmation) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le nouveau mot de passe doit comporter au moins 6 caractères.';
      return;
    }

    if (this.password !== this.passwordConfirmation) {
      this.errorMessage = 'Les deux mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;

    this.authService
      .resetPassword(this.code.trim(), this.password, this.passwordConfirmation)
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          this.notification.success('Votre mot de passe a été modifié avec succès.');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.loading = false;
          console.error('Reset password error:', err);
          this.errorMessage =
            err.error?.error?.message ||
            'Le code de réinitialisation est invalide ou a expiré. Veuillez refaire une demande.';
        },
      });
  }
}
