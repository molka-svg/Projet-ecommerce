# Backend — API Strapi (E-shop)

API REST du site e-commerce, développée avec **Strapi 5** et une base **SQLite**.
Elle gère les produits, les catégories, les utilisateurs (authentification JWT), les commandes et le paiement **Stripe**.

## Prérequis

- **Node.js** 20 à 26 (recommandé : 24 LTS)
- **npm**

## Installation

```bash
cd backend
npm install
```

## Configuration

Copier le fichier d'exemple :

```bash
cp .env.example .env
```

(sous Windows PowerShell : `Copy-Item .env.example .env`)

Puis compléter le fichier `.env` :

| Variable | Rôle |
|---|---|
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY` | Secrets Strapi : mettre des chaînes aléatoires |
| `CLIENT_URL` / `CORS_ORIGINS` | URL du frontend Angular (`http://localhost:4200`) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe **de test** (`sk_test_...`). Vide = paiement simulé |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe (optionnel) |
| `SEED_DEMO_DATA` | `true` = crée des catégories et produits de démonstration au démarrage |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Compte administrateur de la boutique créé par le seed |

Générer un secret aléatoire :

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

> ⚠️ Le fichier `.env` contient des secrets : il est exclu de Git par le `.gitignore`.

## Lancement

```bash
npm run develop
```

| Adresse | Description |
|---|---|
| http://localhost:1337/api | API REST |
| http://localhost:1337/admin | Panneau d'administration Strapi (au premier lancement : créer le compte super-administrateur) |

Autres commandes :

| Commande | Description |
|---|---|
| `npm run develop` | Mode développement (rechargement automatique, Content-Type Builder actif) |
| `npm run build` | Compile le panneau d'administration |
| `npm run start` | Mode production |

## Rôles et permissions

Les permissions sont écrites dans `src/index.js` et appliquées automatiquement à chaque démarrage :

| Rôle | Droits |
|---|---|
| **Public** | Lire les produits et les catégories |
| **Authenticated** | + Commander, voir ses commandes, modifier son profil |
| **Admin** | + Créer / modifier / supprimer produits et catégories, gérer les commandes, envoyer des images |

Pour donner le rôle Admin à un utilisateur : admin Strapi → *Content Manager* → *User* → champ *Role*.

## Principales routes

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/auth/local/register` | Public | Inscription |
| POST | `/api/auth/local` | Public | Connexion → renvoie un JWT |
| POST | `/api/auth/forgot-password` | Public | Mot de passe oublié |
| POST | `/api/auth/reset-password` | Public | Réinitialisation du mot de passe |
| GET | `/api/products`, `/api/categories` | Public | Catalogue |
| POST / PUT / DELETE | `/api/products`, `/api/categories` | Admin | Gestion du catalogue |
| GET / PUT | `/api/profile` | Connecté | Profil, rôle et adresse |
| POST | `/api/orders/checkout-session` | Connecté | Crée la commande et la session Stripe |
| GET | `/api/orders/verify-session/:id` | Public | Vérifie le paiement auprès de Stripe |
| GET | `/api/orders/my-orders` | Connecté | Commandes du client |
| GET / PUT | `/api/orders` | Admin | Gestion des commandes |
| POST | `/api/orders/stripe-webhook` | Stripe | Confirmation de paiement (signature vérifiée) |

Les routes protégées attendent l'en-tête : `Authorization: Bearer <jwt>`.

## Paiement Stripe

1. Le client valide son panier ; le serveur **recalcule les prix depuis la base**.
2. Strapi crée la commande (`pending`) et une session **Stripe Checkout**.
3. Le client paie sur la page hébergée par Stripe.
4. Au retour, Strapi vérifie le paiement auprès de Stripe, passe la commande à `paid` et décrémente le stock.

Carte de test : `4242 4242 4242 4242`, date d'expiration future, n'importe quel CVC.

Webhook en local (optionnel, avec le [Stripe CLI](https://docs.stripe.com/stripe-cli)) :

```bash
stripe listen --forward-to localhost:1337/api/orders/stripe-webhook
```

Copier ensuite le secret `whsec_...` affiché dans `STRIPE_WEBHOOK_SECRET`.

## Structure

```
backend/
├── config/                 # serveur, base de données, CORS, plugins (JWT 7 jours)
├── src/
│   ├── api/
│   │   ├── category/       # catégories (CRUD généré)
│   │   ├── product/        # produits (CRUD généré)
│   │   ├── order/          # commandes + routes Stripe personnalisées
│   │   └── profile/        # route personnalisée /api/profile
│   ├── extensions/
│   │   └── users-permissions/  # champs d'adresse ajoutés à l'utilisateur
│   ├── index.js            # rôles et permissions appliqués au démarrage
│   └── seed.js             # données de démonstration
├── .env.example            # modèle de configuration
└── package.json
```

## Dépannage

| Problème | Solution |
|---|---|
| `The port 1337 is already used` | Strapi tourne déjà : fermer l'autre terminal ou changer `PORT` dans `.env` |
| Erreur CORS dans le navigateur | Vérifier `CORS_ORIGINS=http://localhost:4200` dans `.env` |
| `403 Forbidden` | Le rôle n'a pas la permission : voir `src/index.js` ou *Settings → Roles* |
| Paiement « simulé » | `STRIPE_SECRET_KEY` est vide dans `.env` |
