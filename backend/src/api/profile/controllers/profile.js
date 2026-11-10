'use strict';

const USER_UID = 'plugin::users-permissions.user';
const EDITABLE_FIELDS = ['firstName', 'lastName', 'phone', 'address', 'postalCode', 'city', 'country'];

function toProfile(user) {
  return {
    id: user.id,
    documentId: user.documentId,
    username: user.username,
    email: user.email,
    confirmed: user.confirmed,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    address: user.address,
    postalCode: user.postalCode,
    city: user.city,
    country: user.country,
    role: user.role ? { id: user.role.id, name: user.role.name, type: user.role.type } : null,
    createdAt: user.createdAt,
  };
}

module.exports = {
  /** GET /api/profile — profil du client connecté (avec son rôle) */
  async me(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const user = await strapi.db
      .query(USER_UID)
      .findOne({ where: { id: ctx.state.user.id }, populate: ['role'] });
    ctx.body = toProfile(user);
  },

  /** PUT /api/profile — seuls les champs d'adresse sont modifiables (pas le rôle !) */
  async update(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const body = ctx.request.body ?? {};
    const data = {};
    for (const field of EDITABLE_FIELDS) {
      if (typeof body[field] === 'string') data[field] = body[field].trim().slice(0, 200);
    }

    const user = await strapi.db.query(USER_UID).update({
      where: { id: ctx.state.user.id },
      data,
      populate: ['role'],
    });
    ctx.body = toProfile(user);
  },
};
