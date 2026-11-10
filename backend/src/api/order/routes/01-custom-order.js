'use strict';

/**
 * Routes personnalisées des commandes.
 * Le préfixe « 01- » garantit qu'elles sont chargées AVANT les routes CRUD
 * (sinon « /orders/my-orders » serait interprété comme « /orders/:id »).
 */
module.exports = {
  routes: [
    { method: 'POST', path: '/orders/checkout-session', handler: 'order.checkoutSession' },
    { method: 'GET', path: '/orders/verify-session/:id', handler: 'order.verifySession' },
    { method: 'GET', path: '/orders/my-orders', handler: 'order.myOrders' },
    {
      method: 'POST',
      path: '/orders/stripe-webhook',
      handler: 'order.stripeWebhook',
      // Stripe n'envoie pas de JWT : la sécurité repose sur la signature du webhook.
      config: { auth: false },
    },
  ],
};
