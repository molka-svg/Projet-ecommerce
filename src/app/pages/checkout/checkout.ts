import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { CheckoutPayload } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  authService = inject(AuthService);
  private orderService = inject(OrderService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  // Form Fields
  email = '';
  firstName = '';
  lastName = '';
  address = '';
  postalCode = '';
  city = '';
  country = 'France';
  phone = '';

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    if (this.cartService.items.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    // Pre-fill if authenticated
    const user = this.authService.currentUser;
    if (user) {
      this.email = user.email || '';
      this.firstName = user.firstName || '';
      this.lastName = user.lastName || '';
      this.address = user.address || '';
      this.postalCode = user.postalCode || '';
      this.city = user.city || '';
      this.country = user.country || 'France';
      this.phone = user.phone || '';
    }
  }

  get shippingCost(): number {
    return this.cartService.subtotal >= 80 ? 0 : 9.9;
  }

  get total(): number {
    return this.cartService.subtotal + this.shippingCost;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.email.includes('@')) {
      this.errorMessage = 'Veuillez saisir une adresse e-mail valide.';
      return;
    }

    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.errorMessage = 'Veuillez renseigner vos prénom et nom.';
      return;
    }

    if (!this.address.trim() || !this.postalCode.trim() || !this.city.trim()) {
      this.errorMessage = 'Veuillez renseigner votre adresse de livraison complète.';
      return;
    }

    this.loading = true;

    const payload: CheckoutPayload = {
      items: this.cartService.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
      })),
      customer: {
        email: this.email.trim(),
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
      },
      shippingAddress: {
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        address: this.address.trim(),
        postalCode: this.postalCode.trim(),
        city: this.city.trim(),
        country: this.country.trim(),
        phone: this.phone.trim(),
      },
    };

    this.orderService.createCheckoutSession(payload).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.checkoutUrl) {
          // Stripe session URL provided - redirect to Stripe Checkout
          window.location.href = res.checkoutUrl;
        } else if (res.requiresStripeConfiguration) {
          // In test mode without live Stripe key, order was created in DB
          this.cartService.clearCart();
          this.notification.info(
            'Commande enregistrée. La clé Stripe de test peut être configurée dans le backend.'
          );
          this.router.navigate(['/payment-success'], {
            queryParams: {
              session_id: res.sessionId || 'test-mode',
              order_number: res.orderNumber,
            },
          });
        } else {
          this.errorMessage = res.message || 'Impossible d’initialiser le paiement.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur checkout:', err);
        this.errorMessage =
          err.error?.error?.message ||
          err.error?.message ||
          'Une erreur est survenue lors de la création de la commande.';
      },
    });
  }
}
