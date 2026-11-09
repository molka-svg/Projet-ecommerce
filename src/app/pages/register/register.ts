import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.username.trim() || !this.email.trim() || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit comporter au moins 6 caractères.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les deux mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;

    this.authService.register(this.username.trim(), this.email.trim(), this.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.notification.success('Votre compte eshop a été créé avec succès !');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        this.errorMessage =
          err.error?.error?.message ||
          'Une erreur est survenue lors de l’inscription. Cet email ou identifiant est peut-être déjà utilisé.';
      },
    });
  }
}
