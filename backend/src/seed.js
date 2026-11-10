'use strict';

/**
 * Données de démonstration (activées avec SEED_DEMO_DATA=true dans .env).
 * N'insère rien si le catalogue contient déjà des produits.
 */

const CATEGORIES = [
  { name: 'Maison', description: 'Objets du quotidien, bougies et décoration.' },
  { name: 'Accessoires', description: 'Sacs, pochettes et petits essentiels.' },
  { name: 'Papeterie', description: 'Carnets, cartes et fournitures.' },
];

const PRODUCTS = [
  { name: 'Bougie parfumée au figuier', price: 24.9, stock: 30, sku: 'MAI-001', featured: true, category: 'Maison' },
  { name: 'Plaid en lin lavé', price: 79, stock: 12, sku: 'MAI-002', featured: true, category: 'Maison' },
  { name: 'Vase en grès émaillé', price: 39.5, stock: 4, sku: 'MAI-003', featured: false, category: 'Maison' },
  { name: 'Sac cabas en toile', price: 34, stock: 25, sku: 'ACC-001', featured: true, category: 'Accessoires' },
  { name: 'Pochette en cuir végétal', price: 49, stock: 0, sku: 'ACC-002', featured: false, category: 'Accessoires' },
  { name: 'Porte-clés en laiton', price: 14.5, stock: 60, sku: 'ACC-003', featured: false, category: 'Accessoires' },
  { name: 'Carnet A5 papier recyclé', price: 12.9, stock: 80, sku: 'PAP-001', featured: true, category: 'Papeterie' },
  { name: 'Coffret de cartes postales', price: 18, stock: 3, sku: 'PAP-002', featured: false, category: 'Papeterie' },
];

async function seedDemoData(strapi, adminRole) {
  const productCount = await strapi.db.query('api::product.product').count();

  if (productCount === 0) {
    const categories = {};
    for (const cat of CATEGORIES) {
      categories[cat.name] = await strapi.documents('api::category.category').create({ data: cat });
    }

    for (const { category, ...product } of PRODUCTS) {
      await strapi.documents('api::product.product').create({
        data: {
          ...product,
          description: `${product.name} — fabriqué avec soin, en petite série. Livraison offerte dès 80 €.`,
          categorie: categories[category].documentId,
        },
      });
    }
    strapi.log.info(`[seed] ${CATEGORIES.length} catégories et ${PRODUCTS.length} produits créés`);
  }

  // Compte administrateur de la boutique (rôle « Admin » de l'API, différent du super-admin Strapi)
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    const userService = strapi.plugin('users-permissions').service('user');
    const existing = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { email: email.toLowerCase() } });

    if (!existing) {
      await userService.add({
        username: email.split('@')[0],
        email: email.toLowerCase(),
        password,
        provider: 'local',
        confirmed: true,
        blocked: false,
        role: adminRole.id,
      });
      strapi.log.info(`[seed] Compte admin boutique créé : ${email}`);
    }
  }
}

module.exports = { seedDemoData };
