'use strict';

/** Ajoute les champs d'adresse au modèle « User » du plugin users-permissions. */
module.exports = (plugin) => {
  Object.assign(plugin.contentTypes.user.schema.attributes, {
    firstName: { type: 'string', maxLength: 80 },
    lastName: { type: 'string', maxLength: 80 },
    phone: { type: 'string', maxLength: 30 },
    address: { type: 'string', maxLength: 200 },
    postalCode: { type: 'string', maxLength: 20 },
    city: { type: 'string', maxLength: 80 },
    country: { type: 'string', maxLength: 80 },
  });
  return plugin;
};
