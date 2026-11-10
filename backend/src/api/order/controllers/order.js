'use strict';

const { factories } = require('@strapi/strapi');

const ORDER_UID = 'api::order.order';

module.exports = factories.createCoreController(ORDER_UID, ({ strapi }) => {
  const orderService = () => strapi.service(ORDER_UID);

  return {
    /** POST /api/orders/checkout-session — client connecté uniquement */
    async checkoutSession(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté pour passer commande.');
      }
      const order = await orderService().createFromCart(ctx.request.body ?? {}, user);

      const stripe = orderService().getStripe();
      if (stripe) {
        const session = await orderService().createStripeSession(order);
        ctx.body = {
          success: true,
          orderId: order.id,
          orderNumber: order.orderNumber,
          sessionId: session.id,
          checkoutUrl: session.url,
        };
        return;
      }

      if (process.env.NODE_ENV === 'production') {
        return ctx.internalServerError('Le paiement en ligne n’est pas configuré.');
      }

      // Mode démo (développement, sans clé Stripe) : le paiement est simulé.
      strapi.log.warn(`[DEMO] Paiement simulé pour la commande ${order.orderNumber}`);
      await orderService().markPaid(order);
      ctx.body = {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        requiresStripeConfiguration: true,
        message: 'Mode démo : paiement simulé (ajoutez STRIPE_SECRET_KEY pour Stripe).',
      };
    },

    /** GET /api/orders/verify-session/:id — id = session Stripe (cs_...) ou numéro de commande */
    async verifySession(ctx) {
      const { id } = ctx.params;
      let order = await strapi.db.query(ORDER_UID).findOne({
        where: { $or: [{ stripeSessionId: id }, { orderNumber: id }] },
      });
      if (!order) return ctx.notFound('Commande introuvable.');

      const stripe = orderService().getStripe();
      if (stripe && order.stripeSessionId && order.paymentStatus !== 'paid') {
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        if (session.payment_status === 'paid') {
          order = await orderService().markPaid(order, session.payment_intent);
        }
      }

      ctx.body = { success: order.paymentStatus === 'paid', order: orderService().toPublicOrder(order) };
    },

    /** GET /api/orders/my-orders — commandes du client connecté uniquement */
    async myOrders(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const orders = await strapi.db.query(ORDER_UID).findMany({
        where: { user: user.id },
        orderBy: { createdAt: 'desc' },
      });
      ctx.body = { data: orders.map(orderService().toPublicOrder) };
    },

    /** POST /api/orders/stripe-webhook — confirmation de paiement envoyée par Stripe */
    async stripeWebhook(ctx) {
      const stripe = orderService().getStripe();
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!stripe || !secret) return ctx.notFound();

      const rawBody = ctx.request.body?.[Symbol.for('unparsedBody')];
      let event;
      try {
        event = stripe.webhooks.constructEvent(rawBody, ctx.request.headers['stripe-signature'], secret);
      } catch (err) {
        return ctx.badRequest(`Signature Stripe invalide : ${err.message}`);
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const order = await strapi.db.query(ORDER_UID).findOne({ where: { stripeSessionId: session.id } });
        if (order && session.payment_status === 'paid' && order.paymentStatus !== 'paid') {
          await orderService().markPaid(order, session.payment_intent);
        }
      }
      if (event.type === 'checkout.session.expired') {
        const session = event.data.object;
        await strapi.db.query(ORDER_UID).update({
          where: { stripeSessionId: session.id, paymentStatus: 'pending' },
          data: { paymentStatus: 'cancelled', orderStatus: 'cancelled' },
        });
      }

      ctx.body = { received: true };
    },
  };
});
