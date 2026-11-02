import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Boutique (public)
  {
    path: '',
    title: 'eshop. — Accueil',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'products',
    title: 'Catalogue — eshop.',
    loadComponent: () =>
      import('./pages/product-list/product-list').then((m) => m.ProductListComponent),
  },
  {
    path: 'products/:id',
    title: 'Produit — eshop.',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'categories',
    title: 'Catégories — eshop.',
    loadComponent: () =>
      import('./pages/categories/categories').then((m) => m.CategoriesComponent),
  },
  {
    path: 'search',
    title: 'Recherche — eshop.',
    loadComponent: () => import('./pages/search/search').then((m) => m.SearchComponent),
  },
  {
    path: 'cart',
    title: 'Panier — eshop.',
    loadComponent: () => import('./pages/cart/cart').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    title: 'Paiement — eshop.',
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.CheckoutComponent),
  },
  {
    path: 'payment-success',
    title: 'Commande confirmée — eshop.',
    loadComponent: () =>
      import('./pages/payment-success/payment-success').then((m) => m.PaymentSuccessComponent),
  },
  {
    path: 'payment-cancel',
    title: 'Paiement annulé — eshop.',
    loadComponent: () =>
      import('./pages/payment-cancel/payment-cancel').then((m) => m.PaymentCancelComponent),
  },

  // Authentification
  {
    path: 'login',
    title: 'Connexion — eshop.',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    title: 'Inscription — eshop.',
    loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    title: 'Mot de passe oublié — eshop.',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    title: 'Nouveau mot de passe — eshop.',
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then((m) => m.ResetPasswordComponent),
  },

  // Espace client (connecté)
  {
    path: 'profile',
    title: 'Mon profil — eshop.',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path: 'orders',
    title: 'Mes commandes — eshop.',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/orders/orders').then((m) => m.OrdersComponent),
  },

  // Administration (rôle Admin)
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        title: 'Administration — eshop.',
        loadComponent: () =>
          import('./pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'products',
        title: 'Produits — Administration',
        loadComponent: () =>
          import('./pages/admin-products/admin-products').then((m) => m.AdminProductsComponent),
      },
      {
        path: 'products/new',
        title: 'Nouveau produit — Administration',
        loadComponent: () =>
          import('./pages/admin-product-form/admin-product-form').then(
            (m) => m.AdminProductFormComponent
          ),
      },
      {
        path: 'products/:id/edit',
        title: 'Modifier le produit — Administration',
        loadComponent: () =>
          import('./pages/admin-product-form/admin-product-form').then(
            (m) => m.AdminProductFormComponent
          ),
      },
      {
        path: 'categories',
        title: 'Catégories — Administration',
        loadComponent: () =>
          import('./pages/admin-categories/admin-categories').then(
            (m) => m.AdminCategoriesComponent
          ),
      },
      {
        path: 'orders',
        title: 'Commandes — Administration',
        loadComponent: () =>
          import('./pages/admin-orders/admin-orders').then((m) => m.AdminOrdersComponent),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
