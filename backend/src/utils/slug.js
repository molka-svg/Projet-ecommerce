'use strict';

function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Génère un slug unique pour un content-type (« sac-en-toile », « sac-en-toile-2 », ...). */
async function uniqueSlug(strapi, uid, name, excludeId) {
  const base = slugify(name) || 'item';
  let slug = base;
  for (let i = 2; ; i++) {
    const existing = await strapi.db.query(uid).findOne({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${i}`;
  }
}

/** Lifecycles réutilisables : remplit le slug automatiquement à la création via l'API. */
function slugLifecycles(uid) {
  return {
    async beforeCreate(event) {
      const { data } = event.params;
      if (!data.slug && data.name) {
        data.slug = await uniqueSlug(strapi, uid, data.name);
      }
    },
  };
}

module.exports = { slugify, uniqueSlug, slugLifecycles };
