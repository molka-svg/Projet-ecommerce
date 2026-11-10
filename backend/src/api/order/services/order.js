'use strict';

const crypto = require('node:crypto');
const { factories } = require('@strapi/strapi');

const { ValidationError } = require('@strapi/utils').errors;

const FREE_SHIPPING_THRESHOLD = 80;
const SHIPPING_COST = 9.9;
const MAX_QTY_PER_ITEM = 99;

const round2 = (n) => Math.round(n * 100) / 100;

/** Client Stripe, ou null si STRIPE_SECRET_KEY n'est pas configurée (mode démo). */
let stripeClient;
function getStripe() {
  if (stripeClient !== undefined) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  stripeClient = key ? new (require('stripe'))(key) : null;
  return stripeClient;
}

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CMD-${date}-${random}`;
}

/** Champs d'une commande que l'on peut renvoyer au client. */
function toPublicOrder(order) {
  return {
    id: order.id,
    documentId: order.documentId,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    items: order.items,
    quantity: order.quantity ?? 0,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping ?? 0),
    total: Number(order.total),
    currency: order.currency,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt,
  };
}

const requiredString = (value, label, max = 200) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError(`${label} est obligatoire.`);
  }
  return value.trim().slice(0, max);
};

const optionalString = (value, max = 200) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

module.exports = factories.createCoreService('api::order.order', ({ strapi }) => ({
  getStripe,
  toPublicOrder,

  /**
   * Valide le panier envoyé par le navigateur, recalcule les prix depuis la base
   * (on ne fait JAMAIS confiance au prix envoyé par le client) et crée la commande.
   */
  async createFromCart({ items, customer, shippingAddress }, user) {
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      throw new ValidationError('Le panier est vide ou invalide.');
    }

    const email = requiredString(customer?.email ?? user?.email, "L'e-mail", 120);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError("L'adresse e-mail est invalide.");
    }

    const address = {
      firstName: requiredString(shippingAddress?.firstName, 'Le prénom', 80),
      lastName: requiredString(shippingAddress?.lastName, 'Le nom', 80),
      address: requiredString(shippingAddress?.address, "L'adresse", 200),
      postalCode: requiredString(shippingAddress?.postalCode, 'Le code postal', 20),
      city: requiredString(shippingAddress?.city, 'La ville', 80),
      country: requiredString(shippingAddress?.country, 'Le pays', 80),
      phone: optionalString(shippingAddress?.phone, 30),
    };

    const lines = [];
    for (const item of items) {
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
        throw new ValidationError('Quantité invalide dans le panier.');
      }

      const ref = String(item?.id ?? '');
      const where = /^\d+$/.test(ref) ? { id: Number(ref) } : { documentId: ref };
      const product = await strapi.db
        .query('api::product.product')
        .findOne({ where, populate: ['Image'] });

      if (!product) {
        throw new ValidationError("Un article de votre panier n'existe plus.");
      }
      if ((product.stock ?? 0) < quantity) {
        throw new ValidationError(
          `Stock insuffisant pour « ${product.name} » (${product.stock ?? 0} disponible(s)).`
        );
      }

      const price = Number(product.price);
      lines.push({
        productId: product.id,
        documentId: product.documentId,
        name: product.name,
        price,
        quantity,
        imageUrl: product.Image?.url ?? null,
        subtotal: round2(price * quantity),
      });
    }

    const subtotal = round2(lines.reduce((sum, l) => sum + l.subtotal, 0));
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    return strapi.documents('api::order.order').create({
      data: {
        orderNumber: generateOrderNumber(),
        customerEmail: email,
        customerName: `${address.firstName} ${address.lastName}`,
        items: lines,
        quantity: lines.reduce((sum, l) => sum + l.quantity, 0),
        subtotal,
        shipping,
        total: round2(subtotal + shipping),
        currency: 'eur',
        paymentStatus: 'pending',
        orderStatus: 'processing',
        shippingAddress: address,
        user: user?.id ?? null,
      },
    });
  },

  /** Crée la session Stripe Checkout associée à la commande. */
  async createStripeSession(order) {
    const stripe = getStripe();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';

    const line_items = order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(item.price * 100),
        product_data: { name: item.name },
      },
    }));
    if (Number(order.shipping) > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(Number(order.shipping) * 100),
          product_data: { name: 'Livraison' },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: order.customerEmail,
      line_items,
      metadata: { orderNumber: order.orderNumber },
      success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment-cancel?order_number=${order.orderNumber}`,
    });

    await strapi.documents('api::order.order').update({
      documentId: order.documentId,
      data: { stripeSessionId: session.id },
    });

    return session;
  },

  /** Marque la commande payée et décrémente le stock (une seule fois). */
  async markPaid(order, paymentIntentId) {
    if (!order.stockDecremented) {
      for (const item of order.items ?? []) {
        const product = await strapi.db
          .query('api::product.product')
          .findOne({ where: { id: item.productId } });
        if (product) {
          await strapi.db.query('api::product.product').update({
            where: { id: product.id },
            data: { stock: Math.max(0, (product.stock ?? 0) - item.quantity) },
          });
        }
      }
    }

    return strapi.db.query('api::order.order').update({
      where: { id: order.id },
      data: {
        paymentStatus: 'paid',
        stockDecremented: true,
        ...(paymentIntentId ? { stripePaymentIntentId: String(paymentIntentId) } : {}),
      },
    });
  },
}));
