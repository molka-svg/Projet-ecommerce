'use strict';

const { seedDemoData } = require('./seed');

/**
 * Permissions de l'API REST par rôle (plugin users-permissions).
 * Elles sont appliquées à chaque démarrage : la configuration est versionnée avec le code
 * au lieu d'être cochée à la main dans l'admin Strapi.
 */
const PUBLIC_ACTIONS = [
  'api::product.product.find',
  'api::product.product.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
  'api::order.order.verifySession',
];

/** Actions retirées au rôle Public (supprimées en base si elles avaient été accordées avant). */
const PUBLIC_REVOKED_ACTIONS = ['api::order.order.checkoutSession'];

const AUTHENTICATED_ACTIONS = [
  ...PUBLIC_ACTIONS,
  // Commander/payer : réservé aux clients connectés.
  'api::order.order.checkoutSession',
  'api::order.order.myOrders',
  'api::profile.profile.me',
  'api::profile.profile.update',
  'plugin::users-permissions.user.me',
];

const ADMIN_ACTIONS = [
  ...AUTHENTICATED_ACTIONS,
  'api::product.product.create',
  'api::product.product.update',
  'api::product.product.delete',
  'api::category.category.create',
  'api::category.category.update',
  'api::category.category.delete',
  'api::order.order.find',
  'api::order.order.findOne',
  'api::order.order.update',
  'plugin::upload.content-api.upload',
];

async function findOrCreateRole(strapi, type, name, description) {
  const roleQuery = strapi.db.query('plugin::users-permissions.role');
  const existing = await roleQuery.findOne({ where: { type } });
  if (existing) return existing;
  return roleQuery.create({ data: { type, name, description } });
}

async function grant(strapi, role, actions) {
  const permissionQuery = strapi.db.query('plugin::users-permissions.permission');
  const current = await permissionQuery.findMany({ where: { role: role.id } });
  const already = new Set(current.map((p) => p.action));

  for (const action of actions) {
    if (!already.has(action)) {
      await permissionQuery.create({ data: { action, role: role.id } });
    }
  }
}

async function revoke(strapi, role, actions) {
  await strapi.db
    .query('plugin::users-permissions.permission')
    .deleteMany({ where: { role: role.id, action: { $in: actions } } });
}

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    const publicRole = await findOrCreateRole(strapi, 'public', 'Public', 'Visiteurs non connectés');
    const authenticatedRole = await findOrCreateRole(strapi, 'authenticated', 'Authenticated', 'Clients connectés');
    const adminRole = await findOrCreateRole(strapi, 'admin', 'Admin', 'Gestion du catalogue et des commandes');

    await grant(strapi, publicRole, PUBLIC_ACTIONS);
    await revoke(strapi, publicRole, PUBLIC_REVOKED_ACTIONS);
    await grant(strapi, authenticatedRole, AUTHENTICATED_ACTIONS);
    await grant(strapi, adminRole, ADMIN_ACTIONS);

    // Lien envoyé dans l'e-mail « mot de passe oublié » → page Angular.
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';
    const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
    const advanced = (await store.get({ key: 'advanced' })) || {};
    if (advanced.email_reset_password !== `${clientUrl}/reset-password`) {
      await store.set({
        key: 'advanced',
        value: { ...advanced, email_reset_password: `${clientUrl}/reset-password` },
      });
    }

    if (process.env.SEED_DEMO_DATA === 'true') {
      await seedDemoData(strapi, adminRole);
    }
  },
};
