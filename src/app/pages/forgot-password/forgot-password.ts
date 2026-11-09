import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email = '';
  loading = false;
  submitted = false;
  errorMessage = '';

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.email.includes('@')) {
      this.errorMessage = 'Veuillez saisir une adresse e-mail valide.';
      return;
    }

    this.loading = true;

    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
      },
      error: () => {
        // Standard non-disclosing message for security
        this.loading = false;
        this.submitted = true;
      },
    });
  }
}
