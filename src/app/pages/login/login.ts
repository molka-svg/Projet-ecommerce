import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';
  returnUrl = '/';

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/']);
      return;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Veuillez saisir votre identifiant (ou e-mail) et votre mot de passe.';
      return;
    }

    this.loading = true;

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.notification.success(`Bienvenue, ${res.user.firstName || res.user.username} !`);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error:', err);
        this.errorMessage =
          err.error?.error?.message ||
          'Identifiant ou mot de passe incorrect. Veuillez vérifier vos accès.';
      },
    });
  }
}
