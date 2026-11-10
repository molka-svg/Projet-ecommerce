module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      // Seul le frontend Angular (et WordPress éventuel) peut appeler l'API depuis un navigateur.
      origin: env.array('CORS_ORIGINS', ['http://localhost:4200']),
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    // Corps brut conservé pour vérifier la signature des webhooks Stripe.
    config: { includeUnparsed: true },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
