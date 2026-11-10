'use strict';

const { factories } = require('@strapi/strapi');

// Les commandes ne sont jamais créées ni supprimées via l'API REST générique :
// création = /orders/checkout-session, lecture/mise à jour = rôle Admin.
module.exports = factories.createCoreRouter('api::order.order', {
  only: ['find', 'findOne', 'update'],
});
