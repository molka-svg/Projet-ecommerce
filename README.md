# E-shop — Projet e-commerce

Site e-commerce complet :

- **Frontend** : Angular 22 + Tailwind CSS (ce dossier)
- **Backend** : Strapi 5 (dossier [`backend/`](backend/README.md))
- **Paiement** : Stripe Checkout (mode test)

```
Navigateur (Angular :4200)  ──HTTP/JSON + JWT──►  Strapi (:1337/api)  ──►  Base de données
                                                        │
                                                        └──►  Stripe
```

## Fonctionnalités

**Client**
- Catalogue de produits, catégories, recherche, fiche produit
- Panier
- Inscription, connexion, mot de passe oublié, profil
- Commande et paiement par carte (Stripe)
- Historique des commandes

**Administrateur** (rôle *Admin*)
- Tableau de bord
- Gestion des produits (avec images) et des catégories
- Suivi et mise à jour des commandes

## Prérequis

- **Node.js ≥ 24.15** (exigé par Angular CLI 22) — https://nodejs.org
- **npm**

Vérifier : `node -v`

## Installation et lancement

Il faut **deux terminaux** : un pour le backend, un pour le frontend.

### 1. Backend (terminal 1)

```bash
cd backend
npm install
cp .env.example .env        # Windows PowerShell : Copy-Item .env.example .env
npm run develop
```

- API : http://localhost:1337/api
- Admin Strapi : http://localhost:1337/admin (créer le compte au premier lancement)

Détails de la configuration (`.env`, Stripe, permissions) : voir [`backend/README.md`](backend/README.md).

### 2. Frontend (terminal 2)

À la racine du projet :

```bash
npm install
npm start
```

→ Ouvrir **http://localhost:4200**

L'URL de l'API est définie dans `src/environments/environment.ts` (`http://localhost:1337/api`).

## Comptes et tests

- **Compte administrateur de la boutique** : créé automatiquement si `SEED_DEMO_DATA=true`
  (identifiants `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` du fichier `backend/.env`).
- **Paiement de test** : carte `4242 4242 4242 4242`, date future, n'importe quel CVC.

## Authentification

1. `POST /api/auth/local` → Strapi renvoie un **JWT** (valable 7 jours).
2. Le JWT est stocké dans le navigateur (`localStorage` ou `sessionStorage`).
3. Un **intercepteur HTTP** l'ajoute à chaque requête : `Authorization: Bearer <jwt>`.
4. Les **guards** Angular (`authGuard`, `adminGuard`) protègent les pages ; la vraie sécurité est assurée par les **permissions de Strapi**.
5. En cas de réponse `401`, l'utilisateur est déconnecté et renvoyé vers la page de connexion.

## Structure du projet

```
.
├── backend/                    # API Strapi (voir backend/README.md)
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/         # authGuard, adminGuard
│   │   │   ├── interceptors/   # ajout du JWT aux requêtes
│   │   │   └── services/       # auth, produits, catégories, panier, commandes
│   │   ├── models/             # interfaces TypeScript
│   │   ├── pages/              # pages (accueil, panier, checkout, admin…)
│   │   ├── shared/             # composants réutilisables
│   │   └── app.routes.ts       # routes de l'application
│   └── environments/           # URL de l'API
├── angular.json
└── package.json
```

## Commandes utiles (frontend)

| Commande | Description |
|---|---|
| `npm start` | Serveur de développement (http://localhost:4200) |
| `npm run build` | Build de production dans `dist/` |
| `npm test` | Tests unitaires (Vitest) |

## Dépannage

| Problème | Solution |
|---|---|
| `The Angular CLI requires a minimum Node.js version…` | Mettre à jour Node.js (≥ 24.15) |
| Le site s'affiche mais aucun produit | Le backend n'est pas lancé (`cd backend && npm run develop`) |
| Erreur CORS | Vérifier `CORS_ORIGINS=http://localhost:4200` dans `backend/.env` |
| `The port 1337 is already used` | Strapi tourne déjà dans un autre terminal |
